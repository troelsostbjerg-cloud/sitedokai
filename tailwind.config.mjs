/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f4f0e7',
        paper: '#fffdf8',
        brand: { DEFAULT: '#202a24', soft: '#344139' },
        muted: '#626d65',
        sage: { DEFAULT: '#667a63', dark: '#4e6250', soft: '#dfe7db', pale: '#edf2e9' },
        line: { DEFAULT: '#d9d5c9', strong: '#c4c2b5' },
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 28px 80px -48px rgba(32,42,36,0.42)',
        lift: '0 18px 46px -28px rgba(32,42,36,0.32)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [],
};
