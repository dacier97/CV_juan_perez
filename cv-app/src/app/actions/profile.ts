'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'

export async function getProfile() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return null
    }

    return data
}

export async function getPublicProfile() {
    noStore();
    const supabase = await createClient()

    // Fetches the first profile found in the table. 
    // Suitable for a personal single-user application.
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single()

    if (error) {
        console.error('Error fetching public profile:', error)
        return null
    }

    return data
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const full_name = formData.get('full_name') as string
    const role = formData.get('role') as string
    const bio = formData.get('bio') as string
    const skills = JSON.parse(formData.get('skills') as string)
    const experience = JSON.parse(formData.get('experience') as string)
    const education = JSON.parse(formData.get('education') as string)
    const contact_info = JSON.parse(formData.get('contact_info') as string)
    const theme_color = formData.get('theme_color') as string

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
            contact_info,
            theme_color,
            updated_at: new Date().toISOString(),
        })

    if (error) {
        console.error('Error updating profile:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function uploadAvatar(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error('Upload attempt without user session')
        throw new Error('Not authenticated')
    }

    const file = formData.get('avatar') as File
    const slotIndex = parseInt(formData.get('slotIndex') as string)

    if (!file) {
        console.error('No file found in FormData')
        return { error: 'No file uploaded' }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${slotIndex}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    console.log(`Starting upload to bucket 'assets': ${filePath}`)

    // Upload to bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file)

    if (uploadError) {
        console.error('Supabase Storage Error:', uploadError)
        return { error: `Error de Storage: ${uploadError.message}` }
    }

    console.log('Upload successful, getting public URL...')

    const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath)

    if (!publicUrl) {
        console.error('Failed to generate public URL')
        return { error: 'No se pudo generar la URL pública' }
    }

    // Get current gallery
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('avatar_gallery')
        .eq('id', user.id)
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows" which is fine for upsert
        console.error('Error fetching profile gallery:', fetchError)
    }

    let newGallery = [...(profile?.avatar_gallery || ['', '', ''])]
    // Ensure it has at least 3 elements
    while (newGallery.length < 3) newGallery.push('')

    newGallery[slotIndex] = publicUrl
    console.log('Updating profile with new gallery:', newGallery)

    // Update gallery and set as active avatar
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            avatar_gallery: newGallery,
            avatar_url: publicUrl
        })
        .eq('id', user.id)

    if (updateError) {
        console.error('Profile Update Error:', updateError)
        return { error: `Error al actualizar perfil: ${updateError.message}` }
    }

    console.log('Profile updated successfully')
    revalidatePath('/')
    return { success: true, url: publicUrl }
}

export async function selectAvatar(url: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}
