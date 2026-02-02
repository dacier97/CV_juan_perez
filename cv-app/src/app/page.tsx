import { createClient } from '@/lib/supabase/server';
import UnifiedPage from './UnifiedPage';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Daniel Ortiz | Portfolio Profesional",
    description: "Explora mi trayectoria profesional..."
};

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return <UnifiedPage initialUser={user} />;
}
