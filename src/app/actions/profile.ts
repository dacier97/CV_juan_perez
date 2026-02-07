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
        experience: Array.isArray(data.experience) ? data.experience.map((exp: any, index: number) => ({
            id: exp.id || index + 1,
            period: exp.period || '',
            title: exp.title || '',
            description: exp.description || '',
            bullets: Array.isArray(exp.bullets) ? exp.bullets : []
        })) : [],
        education: Array.isArray(data.education) ? data.education.map((edu: any, index: number) => ({
            id: edu.id || index + 1,
            period: edu.period || '',
            degree: edu.degree || '',
            institution: edu.institution || ''
        })) : [],
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
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return createDefaultProfile();

    // 1. Intentar cargar el draft más reciente
    const { data: draft } = await supabase
        .from('drafts')
        .select('content')
        .eq('user_id', user.id)
        .eq('is_current', true)
        .single()

    if (draft) {
        return draft.content as ProfileData;
    }

    // 2. Fallback al perfil principal si no hay draft
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return createDefaultProfile();
    }

    return normalizeProfile(data)
}

export async function getPublicProfile(): Promise<ProfileData> {
    noStore();
    const supabase = await createClient()

    // Intentar traer el draft actual primero para la vista pública también, 
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
            photo: '', // Se gestiona aparte o lo extraemos si existe
            photos: ['', '', ''],
            contactInfo: contact_info
        },
        skills,
        experience,
        education,
        objective: bio,
        themeColor: theme_color
    };

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
            is_current: true
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
        console.error('Error updating profile:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function uploadAvatar(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Not authenticated' }
    }

    const file = formData.get('avatar') as File
    const slotIndex = parseInt(formData.get('slotIndex') as string)

    if (!file) {
        return { success: false, error: 'No file uploaded' }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${slotIndex}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to bucket
    const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file)

    if (uploadError) {
        return { success: false, error: `Error de Storage: ${uploadError.message}` }
    }

    const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath)

    // Get current gallery
    const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_gallery')
        .eq('id', user.id)
        .single()

    let newGallery = ensureMinLength(profile?.avatar_gallery || [], 3);
    newGallery[slotIndex] = publicUrl

    // Update gallery and set as active avatar
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            avatar_gallery: newGallery,
            avatar_url: publicUrl
        })
        .eq('id', user.id)

    if (updateError) {
        return { success: false, error: `Error al actualizar perfil: ${updateError.message}` }
    }

    revalidatePath('/')
    return { success: true, url: publicUrl }
}

export async function selectAvatar(url: string): Promise<ActionResult> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}
