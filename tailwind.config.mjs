/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#f3f8ff',
          light: '#ffffff',
          dark: '#cfe1f2',
        },
        accent: {
          DEFAULT: '#65f0b8',
          bright: '#94ffd2',
          light: '#c8ffe7',
          soft: 'rgba(101, 240, 184, 0.1)',
          dark: '#38b989',
        },
        canvas: {
          DEFAULT: '#07111d',
          soft: '#0d1b2a',
        },
        panel: {
          DEFAULT: '#122235',
          soft: 'rgba(255, 255, 255, 0.045)',
        },
        surface: {
          DEFAULT: '#122235',
          muted: '#0d1b2a',
        },
        muted: {
          DEFAULT: '#9fb3c8',
        },
        border: {
          soft: 'rgba(207, 231, 255, 0.14)',
        },
        score: {
          green: '#22863a',
          yellow: '#b08800',
          red: '#cb2431',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        soft: '0 22px 70px rgba(0, 0, 0, 0.18)',
        card: '0 18px 45px rgba(0, 0, 0, 0.22)',
      },
    },
  },
  plugins: [],
};
