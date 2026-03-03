/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Enabled class-based dark mode
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
                surface: '#F0ECF5',      // Lavender mist
                'surface-dark': '#E4DEF0', // Dusty lavender
                dark: '#2D2640',         // Deep plum text
                'dark-light': '#44385A',
                'dark-lighter': '#6B5F82',
                'dark-border': '#D4C8E8', // Deeper lilac border

                // --- Cozy Dark Mode Specifics ---
                'night-bg': '#16131D',       // Main dark background (very deep purple/grey)
                'night-surface': '#201C29',  // Slightly elevated surface
                'night-border': '#332D42',   // Soft borders in dark mode
                'night-text': '#F5F2F8',     // Main text in dark mode
                'night-text-muted': '#A49EB3',// Muted text in dark mode
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
