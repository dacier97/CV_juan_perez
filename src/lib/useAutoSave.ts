'use client';

import { useEffect, useRef } from 'react';
import { useCVStore } from './store';
import { updateProfile } from '@/app/actions/profile';

import { createClient } from '@/lib/supabase/client';

export function useAutoSave() {
    const { cvData, setIsSaving, setLastSaved } = useCVStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedDataRef = useRef<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if (!cvData) return;

        // Serializar para comparación profunda simple
        const currentDataStr = JSON.stringify(cvData);

        // Si es la primera vez que cargamos datos, los marcamos como "guardados" para no disparar save inmediatamente
        if (lastSavedDataRef.current === null) {
            lastSavedDataRef.current = currentDataStr;
            return;
        }

        // Si los datos no han cambiado desde la última vez (por contenido, no por referencia), no hacemos nada
        if (currentDataStr === lastSavedDataRef.current) {
            return;
        }

        // Limpiar el timeout anterior
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Debounce de 2 segundos para dar más margen en producción
        timeoutRef.current = setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            setIsSaving(true);

            try {
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
                    setLastSaved(new Date());
                    lastSavedDataRef.current = currentDataStr; // Actualizar el ref de datos guardados
                    console.log('Autosave successful:', new Date().toLocaleTimeString());
                } else {
                    console.error('Autosave failed:', result.error);
                }
            } catch (error) {
                console.error('Autosave error:', error);
            } finally {
                setIsSaving(false);
            }
        }, 2000);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [cvData, setIsSaving, setLastSaved]);
}
