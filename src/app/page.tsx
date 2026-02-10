import { createClient } from '@/lib/supabase/server';
import UnifiedPage from './UnifiedPage';
import { Metadata } from 'next';
import { getProfile } from '@/app/actions/profile';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Juan Pérez | Curriculum Vitae Profesional",
    description: "Curriculum Vitae y Trayectoria Profesional de Juan Pérez."
};

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Obtener los datos del perfil actual (getProfile se encarga del seed internamente si está vacío)
    const profileData = await getProfile();

    return <UnifiedPage initialUser={user} initialData={profileData} />;
}
