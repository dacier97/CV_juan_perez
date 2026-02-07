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
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleLogout = async () => {
        startTransition(async () => {
            await signOut();
            router.push('/');
            router.refresh();
        });
    };

    if (variant === 'sidebar') {
        return (
            <button
                onClick={handleLogout}
                disabled={isPending}
                className={className || "w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all mt-auto disabled:opacity-50"}
            >
                <LogOut size={20} className={isPending ? "animate-pulse" : ""} />
                {isPending ? "Cerrando..." : "Cerrar Sesión"}
            </button>
        );
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isPending}
            className={className || "flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"}
        >
            <LogOut size={16} className={isPending ? "animate-pulse" : ""} />
            <span className="text-xs font-bold uppercase tracking-wider">
                {isPending ? "..." : "Salir"}
            </span>
        </button>
    );
}
