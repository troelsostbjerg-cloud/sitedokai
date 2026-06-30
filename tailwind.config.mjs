/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Mørkt "revolutionær AI-tidsalder"-tema
        ink: {
          DEFAULT: '#0a0b12', // baggrund
          soft: '#0f1119',
          panel: '#14161f',
          raised: '#1a1d28',
        },
        line: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          soft: 'rgba(255,255,255,0.05)',
          strong: 'rgba(255,255,255,0.14)',
        },
        text: {
          DEFAULT: '#eef0f6',
          soft: '#aeb4c2',
          dim: '#7a8092',
        },
        violet: {
          DEFAULT: '#8b5cf6',
          bright: '#a78bfa',
          deep: '#6d28d9',
        },
        cyan: {
          DEFAULT: '#22d3ee',
          bright: '#67e8f9',
        },
        // kategori-accenter (match src/data/timeline.ts)
        cat: {
          model: '#a78bfa',
          produkt: '#22d3ee',
          forskning: '#34d399',
          erhverv: '#fbbf24',
          politik: '#fb7185',
          kultur: '#94a3b8',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139,92,246,0.25), 0 18px 60px -18px rgba(139,92,246,0.55)',
        card: '0 24px 70px -30px rgba(0,0,0,0.8)',
      },
      backgroundImage: {
        aurora:
          'radial-gradient(60% 50% at 50% 0%, rgba(139,92,246,0.22) 0%, rgba(34,211,238,0.10) 38%, transparent 72%)',
        'violet-cyan': 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.82)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-dot': 'pulse-dot 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
