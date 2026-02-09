import { createClient } from '@/lib/supabase/server';
import UnifiedPage from './UnifiedPage';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Juan Pérez | Curriculum Vitae Profesional",
    description: "Curriculum Vitae y Trayectoria Profesional de Juan Pérez."
};

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return <UnifiedPage initialUser={user} />;
}
