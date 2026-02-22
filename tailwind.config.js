/** @type {import('tailwindcss').Config} */
export default {
    darkMode: false, // Disabling dark mode for pure Light/Paper cozy theme
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#9B8BB4',      // Soft lilac-dark
                'primary-dark': '#83739B',
                'primary-light': '#D8B4E2', // Bright lilac
                success: '#84CC16',      // Soft lime/mint green
                'success-dark': '#65A30D',
                warning: '#FBBF24',      // Soft yellow/amber
                'warning-dark': '#D97706',
                danger: '#F87171',       // Soft red/peach
                'danger-dark': '#DC2626',
                purple: '#D8B4E2',
                'purple-dark': '#9B8BB4',
                teal: '#2DD4BF',
                'teal-dark': '#0D9488',
                pink: '#F472B6',
                'pink-dark': '#DB2777',
                surface: '#FFFBF0',      // Warm cream paper
                'surface-dark': '#F4EFE6', // Shadowed paper
                dark: '#4A4453',         // Deep purplish gray text
                'dark-light': '#5D566A',
                'dark-lighter': '#7C758A',
                'dark-border': '#E6DDF2', // Lilac tinted border for light mode
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
