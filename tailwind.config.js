/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./popup.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'vod': {
                    'bg': '#0f0f0f',
                    'surface': '#1a1a1a',
                    'border': '#2a2a2a',
                    'accent': '#06b6d4',
                    'accent-hover': '#22d3ee',
                    'text': '#f0f0f0',
                    'text-muted': '#888888',
                },
            },
            fontFamily: {
                'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            animation: {
                'slide-in': 'slideIn 0.2s ease-out',
                'fade-in': 'fadeIn 0.15s ease-out',
            },
            keyframes: {
                slideIn: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}

