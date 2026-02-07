"use client";

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const CVTemplate = dynamic(() => import("@/components/cv/CVTemplate"), {
    ssr: false,
    loading: () => <div className="h-[800px] w-full bg-gray-50 animate-pulse rounded-3xl border border-gray-100 flex items-center justify-center text-gray-400">Cargando plantilla...</div>
});

const CVEditor = dynamic(() => import("@/components/cv/CVEditor"), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-gray-50 animate-pulse rounded-3xl border border-gray-100 flex items-center justify-center text-gray-400">Cargando editor...</div>
});

// El import se hará dentro de la función para evitar problemas de SSR con Next.js

import Sidebar from "@/components/ui/Sidebar";
import Navbar from "@/components/ui/Navbar";
import { getPublicProfile, updateProfile } from '@app/actions/profile';
import DocumentManager from '@/components/ui/DocumentManager';
import { LogIn } from 'lucide-react';
import { ProfileData } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import { useCVStore } from '@/lib/store';
import { useAutoSave } from '@/lib/useAutoSave';

export default function UnifiedPage({ initialUser }: { initialUser: User | null }) {
    const router = useRouter();
    const [supabase] = useState(() => createClient());

    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(true);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDocsOpen, setIsDocsOpen] = useState(false);

    // Store global
    const { cvData, setCVData } = useCVStore();

    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
    const [isAtsFriendly, setIsAtsFriendly] = useState(false);

    // Activar Autosave
    useAutoSave();

    useEffect(() => {
        const loadSession = async () => {
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user ?? null);
            setLoading(false);
        };

        loadSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => listener.subscription.unsubscribe();
    }, [supabase]);

    // Load content data (Public)
    useEffect(() => {
        async function loadContent() {
            const profile = await getPublicProfile();
            setCVData(profile);
            setLoading(false);
        }
        loadContent();
    }, [user, setCVData]);

    const requireAuth = (action: () => void) => {
        if (!user) {
            router.push('/login');
        } else {
            action();
        }
    };

    const handleSave = async () => {
        if (!cvData) return;

        requireAuth(async () => {
            const formData = new FormData();
            formData.append('name', cvData.personalInfo?.name || '');
            formData.append('last_name', cvData.personalInfo?.lastName || '');
            formData.append('role', cvData.personalInfo?.role || '');
            formData.append('objective', cvData.objective || '');
            formData.append('contact_info', JSON.stringify(cvData.personalInfo?.contactInfo || {}));
            formData.append('skills', JSON.stringify(cvData.skills || {}));
            formData.append('experience', JSON.stringify(cvData.experience || []));
            formData.append('education', JSON.stringify(cvData.education || []));
            formData.append('theme_color', cvData.themeColor);

            const result = await updateProfile(formData);
            if (result.success) {
                alert('¡Guardado manual completado!');
            }
        });
    };

    const handleColorChange = (color: string) => {
        if (!cvData) return;
        setCVData({ ...cvData, themeColor: color });
    };

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async (isAts: boolean) => {
        setIsDownloading(true);
        try {
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default || html2pdfModule;

            if (!html2pdf || typeof html2pdf !== 'function') {
                throw new Error('html2pdf library not loaded correctly');
            }

            const fileName = `${cvData?.personalInfo?.name || 'Daniel'}-${cvData?.personalInfo?.lastName || 'Ortiz'}-CV${isAts ? '-ATS' : ''}.pdf`;

            setIsAtsFriendly(isAts);
            setViewMode('preview');

            // Delay para que el render se estabilice
            await new Promise(r => setTimeout(r, 1200));

            const element = document.querySelector('.cv-print-area');
            if (!element) throw new Error('CV area not found');

            const opt = {
                margin: 0,
                filename: fileName,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: 850
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await (html2pdf() as any).set(opt).from(element as HTMLElement).save();
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Hubo un problema al generar el PDF. Por favor, intenta de nuevo o usa la opción Imprimir.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading || !cvData) return null;

    return (
        <div className="flex h-screen bg-background overflow-hidden relative font-sans">
            <Sidebar
                user={user}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                currentColor={cvData?.themeColor || "#FF5E1A"}
                onColorChange={handleColorChange}
                isAtsFriendly={isAtsFriendly}
                onToggleAts={() => setIsAtsFriendly(!isAtsFriendly)}
                userName={`${cvData?.personalInfo?.name || ''} ${cvData?.personalInfo?.lastName || ''}`}
                onDocumentsClick={() => requireAuth(() => setIsDocsOpen(true))}
            />

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <Navbar
                    user={user}
                    onMenuClick={() => setIsSidebarOpen(true)}
                    onSave={handleSave}
                    viewMode={viewMode}
                    onToggleView={() => {
                        if (viewMode === 'preview') {
                            requireAuth(() => setViewMode('edit'));
                        } else {
                            setViewMode('preview');
                        }
                    }}
                    onDownloadPremium={() => handleDownload(false)}
                    onDownloadAts={() => handleDownload(true)}
                    isDownloading={isDownloading}
                />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar bg-gray-50/50">
                    <div className="max-w-5xl mx-auto space-y-8">
                        {viewMode === 'edit' && !!user ? (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <CVEditor data={cvData} onChange={setCVData} />
                            </div>
                        ) : (
                            <div className="animate-in fade-in zoom-in-95 duration-300 cv-print-container">
                                <CVTemplate data={cvData} isAtsFriendly={isAtsFriendly} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DocumentManager isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />

            {!user && (
                <button
                    onClick={() => router.push('/login')}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] group no-print"
                >
                    <LogIn size={24} />
                    <span className="absolute right-16 bg-foreground text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                        Acceso Administrador
                    </span>
                </button>
            )}
        </div>
    );
}
