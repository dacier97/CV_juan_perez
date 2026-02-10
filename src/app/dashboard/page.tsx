import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Layout, FileText, Settings, Edit3 } from 'lucide-react';
import LogoutButton from '@/components/ui/LogoutButton';
import { seedDemoProfile } from '@/lib/seedDemoProfile';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Ejecutar el sembrado de datos DEMO si es necesario (Server Side)
    await seedDemoProfile();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Simple */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                        C
                    </div>
                    <span className="font-bold text-xl tracking-tight">CV Builder</span>
                </div>

                <nav className="flex-1 space-y-1">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-primary/5 text-primary rounded-xl font-bold">
                        <Layout size={20} />
                        Panel
                    </Link>
                </nav>

                <LogoutButton variant="sidebar" />
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-y-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-foreground">Bienvenido de nuevo</h1>
                    <p className="text-gray-500 mt-1">{user.email}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Mi CV Principal</h3>
                        <p className="text-gray-500 text-sm mb-6">Gestiona y edita tu currículum profesional con diseño premium.</p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
                        >
                            Editar ahora <Edit3 size={18} />
                        </Link>
                    </div>

                    {/* Placeholder para más funciones */}
                    <div className="bg-gray-100/50 p-8 rounded-3xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-gray-200 text-gray-400 rounded-2xl flex items-center justify-center mb-4">
                            <Settings size={24} />
                        </div>
                        <h3 className="text-gray-400 font-bold italic">Próximamente</h3>
                        <p className="text-gray-400 text-sm">Más plantillas y analíticas</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
