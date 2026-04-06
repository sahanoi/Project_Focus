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
                /* Adventurer’s Hearth (stitch) — paper, ember, sage */
                surface: '#FFF8F4',
                'surface-dark': '#FFF1E6',
                dark: '#25190D',
                'dark-light': '#3D2E22',
                'dark-lighter': '#554336',
                'dark-border': '#DBC2B0',
                /* Named hearth tokens for explicit use */
                hearth: {
                    background: '#FFF8F4',
                    'on-background': '#25190D',
                    'on-surface': '#25190D',
                    'on-surface-variant': '#554336',
                    'surface-low': '#FFF1E6',
                    'surface-high': '#FBE4D0',
                    'surface-highest': '#F5DFCB',
                    'surface-bright': '#FFF8F4',
                    'outline-variant': '#DBC2B0',
                    secondary: '#45645E',
                    'secondary-container': '#C7EAE1',
                    tertiary: '#B6191A',
                    ink: '#8D4B00',
                },

                // Theme tone tokens (from CSS vars)
                'night-bg': 'rgb(var(--tone-night-bg) / <alpha-value>)',
                'night-surface': 'rgb(var(--tone-night-surface) / <alpha-value>)',
                'night-border': 'rgb(var(--tone-night-border) / <alpha-value>)',
                'night-text': 'rgb(var(--tone-night-text) / <alpha-value>)',
                'night-text-muted': 'rgb(var(--tone-night-text-muted) / <alpha-value>)',

                /* Warm auth / entry — hearth paper (readable, not pure black) */
                'warm-page': '#FFF8F4',
                'warm-card': '#FDF6E3',
                'warm-field': '#FFFFFF',
                'warm-border': '#DBC2B0',
                'warm-text': '#25190D',
                'warm-muted': '#554336',
                'warm-accent': '#8D4B00',
                'warm-night-page': '#1a141b',
                'warm-night-card': '#261f26',
                'warm-night-field': '#FFFFFF', /* White field in dark mode for black text contrast */
                'warm-night-border': '#000000',
                'warm-night-text': '#000000',
                'warm-night-muted': '#000000',
                'warm-night-accent': '#000000',
            },
            fontFamily: {
                sans: ['Manrope', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
                headline: ['Newsreader', 'Georgia', 'serif'],
                body: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
                label: ['Inter', 'system-ui', 'sans-serif'],
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
