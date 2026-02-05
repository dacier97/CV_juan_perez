'use client';

import { useEffect, useRef } from 'react';
import { useCVStore } from './store';
import { updateProfile } from '@/app/actions/profile';

export function useAutoSave() {
    const { cvData, setIsSaving, setLastSaved } = useCVStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const initialLoadRef = useRef(true);

    useEffect(() => {
        // Skip initial mount to prevent saving immediately on load
        if (initialLoadRef.current) {
            initialLoadRef.current = false;
            return;
        }

        if (!cvData) return;

        // Limpiar el timeout anterior
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Debounce de 1.5 segundos
        timeoutRef.current = setTimeout(async () => {
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
                    console.log('Autosave successful:', new Date().toLocaleTimeString());
                } else {
                    console.error('Autosave failed:', result.error);
                }
            } catch (error) {
                console.error('Autosave error:', error);
            } finally {
                setIsSaving(false);
            }
        }, 1500);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [cvData, setIsSaving, setLastSaved]);
}
