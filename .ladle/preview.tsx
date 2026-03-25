import type { GlobalProvider } from '@ladle/react';
import { useEffect } from 'react';
import '../src/index.css';

/** Match app shell: Tailwind `dark` + default theme preset on documentElement. */
export const Provider: GlobalProvider = ({ children }) => {
    useEffect(() => {
        const root = document.documentElement;
        root.classList.add('dark', 'theme-pastel-violet');
        return () => {
            root.classList.remove('dark', 'theme-pastel-violet');
        };
    }, []);
    return (
        <div className="min-h-screen bg-surface dark:bg-night-bg text-dark dark:text-night-text antialiased">
            {children}
        </div>
    );
};
