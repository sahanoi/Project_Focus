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
                primary: 'rgb(var(--tone-primary) / <alpha-value>)',
                'primary-dark': 'rgb(var(--tone-primary-dark) / <alpha-value>)',
                'primary-light': 'rgb(var(--tone-primary-light) / <alpha-value>)',
                success: 'rgb(var(--tone-success) / <alpha-value>)',
                'success-dark': 'rgb(var(--tone-success-dark) / <alpha-value>)',
                warning: 'rgb(var(--tone-warning) / <alpha-value>)',
                'warning-dark': 'rgb(var(--tone-warning-dark) / <alpha-value>)',
                danger: 'rgb(var(--tone-danger) / <alpha-value>)',
                'danger-dark': 'rgb(var(--tone-danger-dark) / <alpha-value>)',
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

                // Theme tone tokens (from CSS vars)
                'night-bg': 'rgb(var(--tone-night-bg) / <alpha-value>)',
                'night-surface': 'rgb(var(--tone-night-surface) / <alpha-value>)',
                'night-border': 'rgb(var(--tone-night-border) / <alpha-value>)',
                'night-text': 'rgb(var(--tone-night-text) / <alpha-value>)',
                'night-text-muted': 'rgb(var(--tone-night-text-muted) / <alpha-value>)',

                /* Warm auth / entry — SOLID BLACK (Maximum Contrast) */
                'warm-page': '#FAF0E8',
                'warm-card': '#FFF9F5',
                'warm-field': '#FFF9F3',
                'warm-border': '#000000',
                'warm-text': '#000000',
                'warm-muted': '#000000',
                'warm-accent': '#000000',
                'warm-night-page': '#1a141b',
                'warm-night-card': '#261f26',
                'warm-night-field': '#FFFFFF', /* White field in dark mode for black text contrast */
                'warm-night-border': '#000000',
                'warm-night-text': '#000000',
                'warm-night-muted': '#000000',
                'warm-night-accent': '#000000',
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
            },
        },
    },
    plugins: [],
}
