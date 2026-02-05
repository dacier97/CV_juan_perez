import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProfileData } from '@/lib/types';

interface CVStore {
    cvData: ProfileData | null;
    isSaving: boolean;
    lastSaved: Date | null;
    setCVData: (data: ProfileData) => void;
    setIsSaving: (isSaving: boolean) => void;
    setLastSaved: (date: Date) => void;
    reset: () => void;
}

export const useCVStore = create<CVStore>()(
    persist(
        (set) => ({
            cvData: null,
            isSaving: false,
            lastSaved: null,
            setCVData: (data) => set({ cvData: data }),
            setIsSaving: (isSaving) => set({ isSaving }),
            setLastSaved: (date) => set({ lastSaved: date }),
            reset: () => set({ cvData: null, lastSaved: null, isSaving: false }),
        }),
        {
            name: 'cv-storage-backup', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
);
