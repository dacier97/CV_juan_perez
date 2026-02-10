import { createClient } from '@/lib/supabase/server';
import UnifiedPage from './UnifiedPage';
import { Metadata } from 'next';
import { seedDemoProfile } from '@/lib/seedDemoProfile';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Juan Pérez | Curriculum Vitae Profesional",
    description: "Curriculum Vitae y Trayectoria Profesional de Juan Pérez."
};

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Ejecutar seed en el servidor si hay usuario
    if (user) {
        await seedDemoProfile();
    }

    return <UnifiedPage initialUser={user} />;
}
