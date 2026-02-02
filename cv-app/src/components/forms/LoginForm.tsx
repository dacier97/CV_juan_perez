"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { signIn } from '@app/actions/auth';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const LoginForm = () => {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) router.replace('/');
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await signIn(formData);
            if (result?.error) {
                setError(result.error);
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-foreground rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200 mx-auto mb-6">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground font-display">Bienvenido</h2>
                    <p className="text-gray-500 mt-2">Ingresa tus credenciales para editar tu CV</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 px-1 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                name="email"
                                type="email"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-foreground/10 focus:border-foreground outline-none transition-all font-medium"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 px-1 uppercase tracking-wider">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                name="password"
                                type="password"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-foreground/10 focus:border-foreground outline-none transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-foreground text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Iniciando Sesión...
                            </>
                        ) : (
                            <>
                                Iniciar Sesión
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-400">
                    <p className="font-medium">Solo acceso autorizado para Daniel Ortiz</p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
