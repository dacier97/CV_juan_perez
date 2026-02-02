import { Share2, Download, Eye, Save, Menu, Edit3, ChevronDown, CheckCircle, Linkedin, Instagram, Facebook } from 'lucide-react';
import { useState } from 'react';

const Navbar = ({
    user,
    onMenuClick,
    onSave,
    viewMode,
    onToggleView,
    onDownloadPremium,
    onDownloadAts
}: {
    user: any,
    onMenuClick: () => void,
    onSave: () => void,
    viewMode: 'edit' | 'preview',
    onToggleView: () => void,
    onDownloadPremium: () => void,
    onDownloadAts: () => void
}) => {
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);

    const socialLinks = {
        linkedin: "https://www.linkedin.com/in/daniel-ortiz-developer-full/",
        instagram: "https://www.instagram.com/danny_ortiza?igsh=ZHFvanY3ZWlsb3J6",
        x: "https://x.com",
        tiktok: "https://tiktok.com",
        facebook: "https://facebook.com"
    };

    const socialIcons = [
        {
            icon: <Linkedin size={18} />,
            href: socialLinks.linkedin || "https://linkedin.com",
            color: "hover:text-[#0077b5]",
            label: "LinkedIn",
            bg: "hover:bg-[#0077b5]/10"
        },
        {
            icon: <Instagram size={18} />,
            href: socialLinks.instagram || "https://instagram.com",
            color: "hover:text-[#e4405f]",
            label: "Instagram",
            bg: "hover:bg-[#e4405f]/10"
        },
        {
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
            href: socialLinks.x || "https://x.com",
            color: "hover:text-black",
            label: "X",
            bg: "hover:bg-black/10"
        },
        {
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                </svg>
            ),
            href: socialLinks.tiktok || "https://tiktok.com",
            color: "hover:text-black",
            label: "TikTok",
            bg: "hover:bg-black/10"
        },
        {
            icon: <Facebook size={18} />,
            href: socialLinks.facebook || "https://facebook.com",
            color: "hover:text-[#1877f2]",
            label: "Facebook",
            bg: "hover:bg-[#1877f2]/10"
        },
    ];

    return (
        <nav className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-10 flex items-center justify-between sticky top-0 z-50 transition-all no-print">
            <div className="flex items-center gap-3 md:gap-6">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-gray-400 hover:text-foreground hover:bg-gray-50 rounded-xl transition-all"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Premium Social Media Icons Distribution */}
            <div className="hidden md:flex items-center gap-1 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100/50 group">
                {socialIcons.map((social, index) => (
                    <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={social.label}
                        className={`p-2.5 text-gray-400 transition-all duration-300 rounded-xl flex items-center justify-center ${social.color} ${social.bg} hover:scale-110 active:scale-95 hover:shadow-sm`}
                    >
                        {social.icon}
                    </a>
                ))}
            </div>

            <div className="flex items-center gap-1 lg:gap-4 font-display">
                {/* Admin Buttons - Conditionally Rendered */}
                {!!user && (
                    <>
                        <button
                            onClick={onToggleView}
                            className="flex items-center gap-2 p-2 lg:px-5 lg:py-2.5 text-sm font-bold text-gray-500 hover:text-foreground hover:bg-gray-50 rounded-xl transition-all"
                        >
                            {viewMode === 'preview' ? (
                                <>
                                    <Edit3 size={18} />
                                    <span className="hidden lg:inline">Editar</span>
                                </>
                            ) : (
                                <>
                                    <Eye size={18} />
                                    <span className="hidden lg:inline">Vista Previa</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={onSave}
                            className="flex items-center gap-2 p-2 lg:px-5 lg:py-2.5 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-all"
                        >
                            <Save size={18} />
                            <span className="hidden lg:inline">Guardar</span>
                        </button>
                        <div className="hidden lg:block w-px h-6 bg-gray-100 mx-2"></div>
                    </>
                )}

                <button
                    onClick={() => {
                        if (typeof window !== 'undefined') {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Enlace copiado al portapapeles');
                        }
                    }}
                    className="flex items-center gap-2 p-2 lg:px-4 lg:py-2.5 text-sm font-bold text-gray-500 hover:text-foreground hover:bg-gray-50 rounded-xl transition-all mr-2"
                    title="Copiar enlace"
                >
                    <Share2 size={18} />
                    <span className="hidden lg:inline">Compartir</span>
                </button>

                <div className="relative">
                    <button
                        onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                        className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-2.5 bg-foreground text-white text-xs lg:text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                    >
                        <Download size={18} className="lg:w-[18px] lg:h-[18px] w-4 h-4" />
                        <span className="inline">Descargar <span className="hidden sm:inline">PDF</span></span>
                        <ChevronDown size={14} className={`ml-1 transition-transform ${isDownloadOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDownloadOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsDownloadOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={() => {
                                        onDownloadPremium();
                                        setIsDownloadOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <CheckCircle size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Versión Premium</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Con foto y diseño visual</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => {
                                        onDownloadAts();
                                        setIsDownloadOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                                        <Download size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Versión ATS Friendly</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Optimizado para lectura automática</p>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
