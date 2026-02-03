"use client";

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CVTemplate from "@/components/cv/CVTemplate";
import Sidebar from "@/components/ui/Sidebar";
import Navbar from "@/components/ui/Navbar";
import CVEditor from "@/components/cv/CVEditor";
import { mockCVData } from "@/lib/mockData";
import { signOut } from '@app/actions/auth';
import { getPublicProfile, updateProfile } from '@app/actions/profile';
import DocumentManager from '@/components/ui/DocumentManager';
import { LogIn } from 'lucide-react';

export default function UnifiedPage({ initialUser }: { initialUser: any }) {
    const router = useRouter();
    const [supabase] = useState(() => createClient());

    // Pattern EXACTO solicitado
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(true);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDocsOpen, setIsDocsOpen] = useState(false);
    const [cvData, setCvData] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
    const [isAtsFriendly, setIsAtsFriendly] = useState(false);

    // useEffect solicitado exactamente
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
            if (profile) {
                setCvData({
                    ...mockCVData,
                    themeColor: profile.theme_color || mockCVData.themeColor,
                    personalInfo: {
                        ...mockCVData.personalInfo,
                        name: profile.full_name?.split(' ')[0] || mockCVData.personalInfo.name,
                        lastName: profile.full_name?.split(' ').slice(1).join(' ') || mockCVData.personalInfo.lastName,
                        role: profile.role || mockCVData.personalInfo.role,
                        photo: profile.avatar_url ? `${profile.avatar_url}?v=${new Date(profile.updated_at).getTime()}` : '/profile.jpg', // Cache busting
                        photos: profile.avatar_gallery?.length ? profile.avatar_gallery : ['/profile.jpg', '/profile.jpg', '/profile.jpg'],
                        contactInfo: profile.contact_info || mockCVData.personalInfo.contactInfo,
                    },
                    objective: profile.bio || mockCVData.objective,
                    skills: profile.skills || mockCVData.skills,
                    experience: profile.experience || mockCVData.experience,
                    education: profile.education || mockCVData.education,
                });
            } else {
                setCvData({
                    ...mockCVData,
                    personalInfo: {
                        ...mockCVData.personalInfo,
                        photo: '/profile.jpg'
                    }
                });
            }
        }
        loadContent();
    }, [user]);

    const requireAuth = (action: () => void) => {
        if (!user) {
            router.push('/login?redirect=/');
            return;
        }
        action();
    };

    const handleSave = async () => {
        requireAuth(async () => {
            const formData = new FormData();
            formData.append('full_name', `${cvData.personalInfo.name} ${cvData.personalInfo.lastName}`);
            formData.append('role', cvData.personalInfo.role);
            formData.append('bio', cvData.objective);
            formData.append('skills', JSON.stringify(cvData.skills));
            formData.append('experience', JSON.stringify(cvData.experience));
            formData.append('education', JSON.stringify(cvData.education));
            formData.append('contact_info', JSON.stringify(cvData.personalInfo.contactInfo));
            formData.append('theme_color', cvData.themeColor);

            const result = await updateProfile(formData);
            if (result.success) {
                router.refresh();
                alert('¡Perfil actualizado con éxito!');
            } else {
                alert('Error: ' + result.error);
            }
        });
    };

    const handleLogout = async () => {
        await signOut();
        window.location.reload();
    };

    const handleColorChange = (color: string) => {
        setCvData({ ...cvData, themeColor: color });
    };

    // Mientras loading: return null solicitado
    if (loading) return null;

    return (
        <div className="flex h-screen bg-background overflow-hidden relative font-sans">
            <Sidebar
                user={user}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout}
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
                    onDownloadPremium={async () => {
                        document.title = `${cvData?.personalInfo?.name || 'Daniel'}-${cvData?.personalInfo?.lastName || 'Ortiz'}-CV`;
                        setIsAtsFriendly(false);
                        setViewMode('preview');
                        await document.fonts.ready;
                        await new Promise(r => setTimeout(r, 300));
                        window.print();
                    }}
                    onDownloadAts={async () => {
                        document.title = `${cvData?.personalInfo?.name || 'Daniel'}-${cvData?.personalInfo?.lastName || 'Ortiz'}-CV-ATS`;
                        setIsAtsFriendly(true);
                        setViewMode('preview');
                        await document.fonts.ready;
                        await new Promise(r => setTimeout(r, 300));
                        window.print();
                    }}
                />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar bg-gray-50/50">
                    <div className="max-w-5xl mx-auto space-y-8">
                        {viewMode === 'edit' && !!user ? (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <CVEditor data={cvData} onChange={setCvData} />
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

            {/* Botón flotante Login si no hay sesión */}
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
