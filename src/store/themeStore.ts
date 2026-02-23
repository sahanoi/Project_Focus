import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeStore {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            theme: 'light', // Default entirely to Light/Paper theme initially
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'focus-ftp-theme',
        }
    )
);
