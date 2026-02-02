'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDocuments() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching documents:', error)
        return []
    }

    return data
}

export async function uploadDocument(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const file = formData.get('file') as File
    if (!file) return { error: 'No file uploaded' }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `documents/${fileName}`

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file)

    if (uploadError) {
        return { error: `Storage error: ${uploadError.message}` }
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath)

    // 3. Save to Database
    const { error: dbError } = await supabase
        .from('documents')
        .insert({
            user_id: user.id,
            name: file.name,
            file_url: publicUrl,
            file_type: file.type
        })

    if (dbError) {
        return { error: `Database error: ${dbError.message}` }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteDocument(id: string, filePath: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Delete from Storage
    const { error: storageError } = await supabase.storage
        .from('assets')
        .remove([filePath])

    if (storageError) {
        console.error('Storage delete error:', storageError)
    }

    // 2. Delete from DB
    const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (dbError) {
        return { error: dbError.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
