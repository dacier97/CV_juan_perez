'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
import { ProfileData, ActionResult } from '@/lib/types'

// ID Maestro de Juan Pérez (proporcionado por el usuario)
const MASTER_USER_ID = '2e371cb5-4e04-442d-aa5c-1eb107e38b2f';

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

    // Normalize Contact Info
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
                : [data.avatar_url || '', '', ''],
            contactInfo: normalizedContact
        },
        skills: {
            professional: Array.isArray(data.skills?.professional) ? data.skills.professional : []
        },
        experience: Array.isArray(data.experience) ? data.experience.map((exp: any, index: number) => {
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
            return {
                id: edu.id || index + 1,
                period: edu.period || edu.year || '',
                degree: edu.degree || '',
                institution: edu.institution || ''
            };
        }) : [],
        objective: data.bio || '',
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

    // SI NO HAY USUARIO -> CARGAR PERFIL PÚBLICO (MODO PORTAFOLIO)
    if (!user) {
        console.log(`[GET_PROFILE] No user. Loading public master profile.`);
        return getPublicProfile();
    }

    console.log(`[GET_PROFILE] Auth user: ${user.email} (ID: ${user.id})`);

    // 1. Cargar Draft y Perfil en paralelo
    const [draftRes, profileRes] = await Promise.all([
        supabase.from('drafts').select('content, updated_at').eq('user_id', user.id).eq('is_current', true).maybeSingle(),
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    ]);

    const draft = draftRes.data;
    const profile = profileRes.data;

    const profileHasRealData = profile && (profile.full_name?.trim() || profile.bio?.trim());

    if (profileHasRealData) {
        const pNormalized = normalizeProfile(profile);
        if (!draft || !draft.content) return pNormalized;

        const d = draft.content as ProfileData;
        const draftIsEmpty = !d.personalInfo?.name?.trim() && !d.objective?.trim();

        if (draftIsEmpty) return pNormalized;

        if (profile.updated_at && draft.updated_at && new Date(profile.updated_at) > new Date(draft.updated_at)) {
            return pNormalized;
        }

        return d;
    }

    // 4. SI TODO ESTÁ VACÍO -> SEED (Para nuevos usuarios)
    const demoData = {
        full_name: "Juan Pérez",
        role: "Senior Project Manager | Infraestructura TI & Transformación Digital",
        bio: "Gerente de proyectos con más de 12 años liderando iniciativas de transformación digital, infraestructura tecnológica y equipos ágiles.",
        avatar_url: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=400",
        theme_color: "#FF5E1A",
        contact_info: { email: user.email || MASTER_USER_ID, phone: "+57 316 555 8899" },
        skills: { professional: ["Gestión de Proyectos", "Cloud Computing", "Scrum", "ITIL"] },
        experience: [{ id: 1, period: "2021-Actual", title: "Senior PM — TechFlow", description: "Infraestructura cloud.", bullets: ["50+ servidores."] }],
        education: [{ id: 1, period: "2014", degree: "Infraestructura TI", institution: "Universidad Nacional" }]
    };

    await supabase.from('profiles').upsert({ id: user.id, ...demoData, updated_at: new Date().toISOString() });
    const uiData = normalizeProfile({ ...demoData });
    await supabase.from('drafts').upsert({ user_id: user.id, content: uiData, is_current: true, updated_at: new Date().toISOString() });

    return uiData;
}

export async function getPublicProfile(): Promise<ProfileData> {
    const supabase = await createClient()

    // Buscamos específicamente el ID de Juan Pérez que el usuario quiere mostrar
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', MASTER_USER_ID)
        .maybeSingle()

    if (error || !data) {
        console.error('Error fetching public profile:', error)
        // Fallback al último perfil actualizado si el ID no coincide exactamente
        const { data: latest } = await supabase
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        return latest ? normalizeProfile(latest) : createDefaultProfile();
    }

    return normalizeProfile(data)
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' };

    const full_name = formData.get('full_name') as string || ''
    const role = formData.get('role') as string || ''
    const bio = formData.get('bio') as string || ''
    const theme_color = formData.get('theme_color') as string || '#FF5E1A'

    let skills, experience, education, contact_info;
    try {
        skills = JSON.parse(formData.get('skills') as string || '{}');
        experience = JSON.parse(formData.get('experience') as string || '[]');
        education = JSON.parse(formData.get('education') as string || '[]');
        contact_info = JSON.parse(formData.get('contact_info') as string || '{}');
    } catch (e) { return { success: false, error: "Invalid data" }; }

    const { data: current } = await supabase.from('profiles').select('avatar_url, avatar_gallery').eq('id', user.id).maybeSingle();

    const profileData: ProfileData = {
        personalInfo: {
            name: full_name.split(' ')[0] || '',
            lastName: full_name.split(' ').slice(1).join(' ') || '',
            role,
            photo: current?.avatar_url || '',
            photos: ensureMinLength(current?.avatar_gallery || [], 3),
            contactInfo: normalizedContact(contact_info)
        },
        skills,
        experience,
        education,
        objective: bio,
        themeColor: theme_color
    };

    const { error: pErr } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name,
        role,
        bio,
        skills,
        experience,
        education,
        contact_info: { email: contact_info.email || '', phone: contact_info.phone || '' },
        theme_color,
        updated_at: new Date().toISOString(),
    });

    if (pErr) return { success: false, error: pErr.message };

    await supabase.from('drafts').upsert({
        user_id: user.id,
        content: profileData,
        is_current: true,
        updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, is_current' });

    revalidatePath('/')
    return { success: true };
}

function normalizedContact(contact: any) {
    return {
        email: contact?.email || '',
        phone: contact?.phone || ''
    };
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

    await supabase.storage.from('assets').upload(fileName, file);
    const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(fileName);

    const { data: profile } = await supabase.from('profiles').select('avatar_gallery').eq('id', user.id).maybeSingle();
    const gallery = [...(profile?.avatar_gallery || [])];
    while (gallery.length <= slotIndex) gallery.push('');
    gallery[slotIndex] = publicUrl;

    await supabase.from('profiles').update({ avatar_url: publicUrl, avatar_gallery: gallery, updated_at: new Date().toISOString() }).eq('id', user.id);

    revalidatePath('/')
    return { success: true, url: publicUrl }
}

export async function selectAvatar(url: string): Promise<ActionResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }
    await supabase.from('profiles').update({ avatar_url: url, updated_at: new Date().toISOString() }).eq('id', user.id);
    revalidatePath('/')
    return { success: true }
}
