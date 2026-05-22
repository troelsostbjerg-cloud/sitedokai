/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#111512',
          light: '#252c27',
          dark: '#0b0e0c',
        },
        accent: {
          DEFAULT: '#6f8a72',
          bright: '#8fa68f',
          light: '#dfe8dc',
          soft: '#edf3ea',
          dark: '#526b55',
        },
        canvas: {
          DEFAULT: '#f7f6f1',
          soft: '#efede5',
        },
        surface: {
          DEFAULT: '#fffdf8',
          muted: '#f8f4ec',
        },
        muted: {
          DEFAULT: '#62665f',
        },
        border: {
          soft: '#e8ded0',
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
        soft: '0 22px 70px rgba(32, 38, 34, 0.055)',
        card: '0 18px 45px rgba(32, 38, 34, 0.09)',
      },
    },
  },
  plugins: [],
};
