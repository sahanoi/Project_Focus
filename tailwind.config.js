/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2563EB',
                'primary-dark': '#1D4ED8',
                'primary-light': '#3B82F6',
                success: '#10B981',
                'success-dark': '#059669',
                warning: '#F59E0B',
                'warning-dark': '#D97706',
                danger: '#EF4444',
                'danger-dark': '#DC2626',
                purple: '#8B5CF6',
                'purple-dark': '#7C3AED',
                teal: '#14B8A6',
                'teal-dark': '#0D9488',
                pink: '#EC4899',
                'pink-dark': '#DB2777',
                surface: '#F9FAFB',
                'surface-dark': '#F3F4F6',
                dark: '#111827',
                'dark-light': '#1F2937',
                'dark-lighter': '#374151',
                'dark-border': '#4B5563',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'bounce-subtle': 'bounceSlight 0.4s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                bounceSlight: {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                    '100%': { transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [],
}
