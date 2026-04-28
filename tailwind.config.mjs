/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#202622',
          light: '#354039',
          dark: '#151a17',
        },
        accent: {
          DEFAULT: '#6f8a72',
          bright: '#8fa68f',
          light: '#dfe8dc',
          soft: '#edf3ea',
          dark: '#526b55',
        },
        canvas: {
          DEFAULT: '#fbf7ef',
          soft: '#f6f0e6',
        },
        surface: {
          DEFAULT: '#fffdf8',
          muted: '#f8f4ec',
        },
        muted: {
          DEFAULT: '#66706a',
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
        display: ['Newsreader', 'Georgia', 'serif'],
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
