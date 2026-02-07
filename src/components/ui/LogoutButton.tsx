"use client";

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { signOut } from '@app/actions/auth';
import { useTransition } from 'react';

interface LogoutButtonProps {
    className?: string;
    variant?: 'sidebar' | 'navbar';
}

export default function LogoutButton({ className, variant = 'navbar' }: LogoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await signOut();
            // window.location.href es la forma más segura de limpiar el cache de Next.js en un logout
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    };

    if (variant === 'sidebar') {
        return (
            <button
                onClick={handleLogout}
                disabled={isLoading}
                className={className || "w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all mt-auto disabled:opacity-50"}
            >
                <LogOut size={20} className={isLoading ? "animate-pulse" : ""} />
                {isLoading ? "Cerrando..." : "Cerrar Sesión"}
            </button>
        );
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className={className || "flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"}
        >
            <LogOut size={16} className={isLoading ? "animate-pulse" : ""} />
            <span className="text-xs font-bold uppercase tracking-wider">
                {isLoading ? "..." : "Salir"}
            </span>
        </button>
    );
}
