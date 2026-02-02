import {
    FileText,
    Layout,
    Image as ImageIcon,
    Settings,
    Download,
    PlusCircle,
    User,
    LogOut,
    Palette,
    Check,
    Zap,
    ChevronDown,
    Linkedin,
    Instagram,
    Facebook
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({
    user,
    isOpen,
    onClose,
    onLogout,
    currentColor,
    onColorChange,
    isAtsFriendly,
    onToggleAts,
    userName,
    onDocumentsClick
}: {
    user: any,
    isOpen: boolean,
    onClose: () => void,
    onLogout: () => void,
    currentColor: string,
    onColorChange: (color: string) => void,
    isAtsFriendly: boolean,
    onToggleAts: () => void,
    userName: string,
    onDocumentsClick: () => void
}) => {
    const [isColorOpen, setIsColorOpen] = useState(false);
    const themes = [
        { name: "Creativo", color: "#FF5E1A", sector: "Diseño, Marketing" },
        { name: "Corporativo", color: "#0F172A", sector: "Banca, Legal" },
        { name: "Médico", color: "#0EA5E9", sector: "Salud, Ciencia" },
        { name: "Tecnológico", color: "#8B5CF6", sector: "IT, Software" },
        { name: "Elegante", color: "#BE185D", sector: "Moda, Lujo" }
    ];

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden no-print ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            <aside className={`fixed md:sticky top-0 left-0 z-[60] w-72 bg-white border-r border-gray-100 flex flex-col h-[100dvh] transition-transform duration-300 ease-in-out transform no-print ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col gap-6 mb-12">
                        <div className="flex items-center justify-between">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent-yellow rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-xl border border-gray-100 group-hover:scale-110 transition-transform duration-300">
                                    <Zap size={24} className="fill-primary/20" />
                                </div>
                            </div>
                            {/* Close button for mobile */}
                            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-foreground p-2">
                                <PlusCircle size={24} className="rotate-45" />
                            </button>
                        </div>

                        <div className="space-y-1 text-center">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] leading-none">Portafolio Pro</p>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground font-display leading-tight uppercase">
                                {userName.split(' ')[0]}<br />
                                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">{userName.split(' ').slice(1).join(' ')}</span>
                            </h2>
                        </div>
                    </div>

                    {/* Admin section - Mis Documentos */}
                    {!!user && (
                        <nav className="space-y-2 mb-10">
                            <button
                                onClick={onDocumentsClick}
                                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group bg-primary/10 text-primary shadow-sm"
                            >
                                <span className="text-primary truncate">
                                    <FileText size={20} />
                                </span>
                                <span className="text-sm font-bold tracking-tight">Mis Documentos</span>
                            </button>
                        </nav>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={() => setIsColorOpen(!isColorOpen)}
                            className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 rounded-lg transition-all group"
                        >
                            <div className="flex items-center gap-2">
                                <Palette size={16} className="text-primary" />
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none pt-1">Personalizar Color</h3>
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isColorOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isColorOpen && (
                            <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                {themes.map((theme) => (
                                    <button
                                        key={theme.color}
                                        onClick={() => onColorChange(theme.color)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${currentColor === theme.color ? 'bg-gray-50 border-gray-200 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-6 h-6 rounded-lg shadow-inner ring-2 ring-white"
                                                style={{ backgroundColor: theme.color }}
                                            ></div>
                                            <div>
                                                <p className={`text-xs font-bold leading-tight ${currentColor === theme.color ? 'text-foreground' : 'text-gray-500'}`}>{theme.name}</p>
                                                <p className="text-[9px] text-gray-400 font-medium">{theme.sector}</p>
                                            </div>
                                        </div>
                                        {currentColor === theme.color && (
                                            <Check size={14} className="text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="pt-6 border-t border-gray-50 space-y-4">
                            <div className="flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    <Zap size={16} className={isAtsFriendly ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
                                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none pt-1">Modo ATS Friendly</h3>
                                </div>
                                <button
                                    onClick={onToggleAts}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isAtsFriendly ? 'bg-primary' : 'bg-gray-200'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAtsFriendly ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            <p className="px-4 text-[9px] text-gray-400 font-medium leading-relaxed">
                                Optimiza tu CV para sistemas automáticos de filtrado. Una sola columna, fuentes estándar y formato simplificado.
                            </p>
                        </div>

                    </div>
                </div>

                {/* User section - Show only if logged in */}
                {!!user && (
                    <div className="mt-auto p-8 border-t border-gray-50 bg-white">
                        <div className="flex items-center gap-4 mb-8 p-3 rounded-2xl bg-gray-50/50">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                                {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-bold text-foreground truncate uppercase">{userName}</p>
                                <p className="text-[10px] text-gray-400 font-medium truncate">Cuenta Profesional</p>
                            </div>
                        </div>

                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                        >
                            <LogOut size={20} />
                            <span className="text-sm font-bold tracking-tight">Cerrar Sesión</span>
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
