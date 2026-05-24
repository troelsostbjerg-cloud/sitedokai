/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1e261f',
          light: '#3a463c',
          dark: '#121713',
        },
        accent: {
          DEFAULT: '#557461',
          bright: '#6f927d',
          light: '#dce8df',
          soft: 'rgba(85, 116, 97, 0.1)',
          dark: '#344d3c',
        },
        canvas: {
          DEFAULT: '#f5f0e8',
          soft: '#ebe3d6',
        },
        panel: {
          DEFAULT: '#fffaf1',
          soft: 'rgba(30, 38, 31, 0.045)',
        },
        surface: {
          DEFAULT: '#fffaf1',
          muted: '#ebe3d6',
        },
        muted: {
          DEFAULT: '#697268',
        },
        border: {
          soft: 'rgba(30, 38, 31, 0.14)',
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
        soft: '0 22px 70px rgba(42, 35, 24, 0.12)',
        card: '0 18px 45px rgba(42, 35, 24, 0.14)',
      },
    },
  },
  plugins: [],
};
