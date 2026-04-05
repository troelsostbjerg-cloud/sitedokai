/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
          dark: '#020617',
        },
        accent: {
          DEFAULT: '#06b6d4',
          light: '#22d3ee',
          dim: '#0e7490',
        },
        score: {
          green: '#22863a',
          yellow: '#b08800',
          red: '#cb2431',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
