'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
import { ProfileData, ActionResult } from '@/lib/types'

// Helper to guarantee safe data structure
function normalizeProfile(data: any): ProfileData {
    if (!data) {
        return createDefaultProfile();
    }

    // Split full_name into name and lastName for the UI
    const fullName = data.full_name || '';
    const nameParts = fullName.split(' ');
    const name = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Normalize Contact Info (Only email + phone)
    const rawContact = data.contact_info || {};
    const normalizedContact = {
        email: rawContact.email || '',
        phone: rawContact.phone || '',
    };

    return {
        personalInfo: {
            name: name,
            lastName: lastName,
            role: data.role || '',
            photo: data.avatar_url || '',
            photos: Array.isArray(data.avatar_gallery) && data.avatar_gallery.length > 0
                ? ensureMinLength(data.avatar_gallery, 3)
                : ['', '', ''],
            contactInfo: normalizedContact
        },
        skills: {
            professional: Array.isArray(data.skills?.professional) ? data.skills.professional : []
        },
        experience: Array.isArray(data.experience) ? data.experience.map((exp: any, index: number) => {
            // Soporte para scripts SQL que usan company/role en vez de title
            let title = exp.title || '';
            if (!title && exp.role && exp.company) {
                title = `${exp.role} — ${exp.company}`;
            } else if (!title && exp.role) {
                title = exp.role;
            }

            return {
                id: exp.id || index + 1,
                period: exp.period || '',
                title: title,
                description: exp.description || '',
                bullets: Array.isArray(exp.bullets) ? exp.bullets : []
            };
        }) : [],
        education: Array.isArray(data.education) ? data.education.map((edu: any, index: number) => {
            // Soporte para scripts SQL que usan 'year' en vez de 'period'
            return {
                id: edu.id || index + 1,
                period: edu.period || edu.year || '',
                degree: edu.degree || '',
                institution: edu.institution || ''
            };
        }) : [],
        objective: data.bio || '', // DB 'bio' maps to UI 'objective'
        themeColor: data.theme_color || '#FF5E1A'
    };
}

function createDefaultProfile(): ProfileData {
    return {
        personalInfo: {
            name: '',
            lastName: '',
            role: '',
            photo: '',
            photos: ['', '', ''],
            contactInfo: { email: '', phone: '' }
        },
        skills: { professional: [] },
        experience: [],
        education: [],
        objective: '',
        themeColor: '#FF5E1A'
    };
}

function ensureMinLength(arr: string[], min: number): string[] {
    const newArr = [...arr];
    while (newArr.length < min) {
        newArr.push('');
    }
    return newArr;
}

export async function getProfile(): Promise<ProfileData> {
    noStore();
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return createDefaultProfile();

    // 1. Cargar Draft y Perfil en paralelo para comparar estados
    const [draftRes, profileRes] = await Promise.all([
        supabase.from('drafts').select('content').eq('user_id', user.id).eq('is_current', true).single(),
        supabase.from('profiles').select('*').eq('id', user.id).single()
    ]);

    const draft = draftRes.data;
    const profile = profileRes.data;

    // 2. Lógica de Decisión: ¿Usar Draft o Perfil Principal?
    const profileHasData = profile && (profile.full_name?.trim() || profile.bio?.trim());

    if (draft && draft.content) {
        const d = draft.content as ProfileData;

        // Si el draft existe pero está vacío (por errores previos) y el perfil TIENE DATA, usamos el perfil
        const draftIsEmpty = !d.personalInfo?.name?.trim() && !d.objective?.trim();

        if (draftIsEmpty && profileHasData) {
            console.log(`[GET_PROFILE] Draft vacío detectado para ${user.email}, recuperando desde Profiles.`);
            return normalizeProfile(profile);
        }

        return d;
    }

    // 3. Si no hay draft, pero hay perfil con datos, lo usamos directamente
    if (profileHasData) {
        return normalizeProfile(profile);
    }

    // 4. SI TODO ESTÁ VACÍO (Nuevo Usuario) -> SEED PREMIUM JUAN PEREZ
    console.log(`[SEED] Sembrando datos maestros para ${user.email}`);

    const demoData = {
        full_name: "Juan Pérez",
        role: "Senior Project Manager | Infratestructura TI & Transformación Digital",
        bio: "Gerente de proyectos con más de 10 años liderando iniciativas de transformación digital, infraestructura tecnológica y equipos ágiles.",
        contact_info: {
            email: user.email || '',
            phone: "+57 316 555 8899"
        },
        skills: {
            professional: ["Gestión de Proyectos", "Infraestructura Cloud", "Scrum / Agile", "ITIL", "Automatización"]
        },
        experience: [
            {
                id: 1,
                period: "2021-Actual",
                title: "Senior PM — TechFlow",
                description: "Liderazgo de migraciones críticas de infraestructura cloud para clientes a nivel nacional.",
                bullets: ["Migración exitosa de 50+ servidores críticos.", "Reducción de costos operativos en nube en 20%."]
            },
            {
                id: 2,
                period: "2018-2021",
                title: "Infra Manager — Telecom Colombia",
                description: "Gestión y expansión de redes GPON y centro de datos regional.",
                bullets: ["Optimización del uptime al 99.9%.", "Liderazgo de equipo de 15 técnicos."]
            }
        ],
        education: [
            { id: 1, period: "2014", degree: "Ingeniería Electrónica", institution: "Universidad Nacional" }
        ],
        theme_color: "#FF5E1A",
        avatar_url: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=400"
    };

    // Crear/Actualizar en Profiles
    await supabase.from('profiles').upsert({
        id: user.id,
        ...demoData,
        updated_at: new Date().toISOString()
    });

    const uiData = normalizeProfile({ ...demoData, avatar_gallery: [demoData.avatar_url] });

    // Crear/Actualizar en Drafts (Fundamental para que el editor lo vea)
    await supabase.from('drafts').upsert({
        user_id: user.id,
        content: uiData,
        is_current: true,
        updated_at: new Date().toISOString()
    });

    return uiData;
}

export async function getPublicProfile(): Promise<ProfileData> {
    const supabase = await createClient()

    // Para la vista pública, no usamos el user_id de la sesión (no hay sesión)
    // o mantener profiles como 'producción'. Usaremos el perfil principal para lo público.
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single()

    if (error) {
        console.error('Error fetching public profile:', error)
        return createDefaultProfile();
    }

    return normalizeProfile(data)
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' };

    const full_name = formData.get('full_name') as string
    const role = formData.get('role') as string
    const bio = formData.get('bio') as string

    let skills, experience, education, contact_info;
    try {
        skills = JSON.parse(formData.get('skills') as string || '{}');
        experience = JSON.parse(formData.get('experience') as string || '[]');
        education = JSON.parse(formData.get('education') as string || '[]');
        contact_info = JSON.parse(formData.get('contact_info') as string || '{}');
    } catch (e) {
        console.error("JSON Parse error", e);
        return { success: false, error: "Invalid data format" };
    }

    const theme_color = formData.get('theme_color') as string

    const profileData: ProfileData = {
        personalInfo: {
            name: full_name.split(' ')[0] || '',
            lastName: full_name.split(' ').slice(1).join(' ') || '',
            role,
            photo: '', // Se gestiona aparte
            photos: ['', '', ''],
            contactInfo: contact_info
        },
        skills,
        experience,
        education,
        objective: bio,
        themeColor: theme_color
    };

    // Para mantener la consistencia con el editor, también recuperamos la foto actual
    const { data: currentProfile } = await supabase.from('profiles').select('avatar_url, avatar_gallery').eq('id', user.id).single();
    if (currentProfile) {
        profileData.personalInfo.photo = currentProfile.avatar_url || '';
        profileData.personalInfo.photos = ensureMinLength(currentProfile.avatar_gallery || [], 3);
    }

    // 1. Marcar versiones anteriores como no actuales
    await supabase
        .from('drafts')
        .update({ is_current: false })
        .eq('user_id', user.id);

    // 2. Insertar nueva versión (Draft)
    const { error: draftError } = await supabase
        .from('drafts')
        .insert({
            user_id: user.id,
            content: profileData,
            is_current: true,
            updated_at: new Date().toISOString()
        });

    if (draftError) {
        console.error('Error saving draft:', draftError);
    }

    // 3. Actualizar perfil principal (Producción)
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name,
            role,
            bio,
            skills,
            experience,
            education,
            contact_info: {
                email: contact_info.email || '',
                phone: contact_info.phone || ''
            },
            theme_color,
            updated_at: new Date().toISOString(),
        })

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/')
    return { success: true };
}

export async function uploadAvatar(formData: FormData): Promise<ActionResult & { url?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const file = formData.get('avatar') as File
    const slotIndex = parseInt(formData.get('slotIndex') as string || '0')
    if (!file) return { success: false, error: 'No file uploaded' }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, file)

    if (uploadError) return { success: false, error: uploadError.message }

    const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName)

    // Actualizar galería en el perfil
    const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_gallery')
        .eq('id', user.id)
        .single()

    const gallery = [...(profile?.avatar_gallery || [])]
    gallery[slotIndex] = publicUrl

    await supabase
        .from('profiles')
        .update({
            avatar_url: publicUrl,
            avatar_gallery: gallery
        })
        .eq('id', user.id)

    revalidatePath('/')
    return { success: true, url: publicUrl }
}

export async function selectAvatar(url: string): Promise<ActionResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    return { success: true }
}
