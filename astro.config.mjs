import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { siteRedirects } from './src/config/redirects.mjs';

export default defineConfig({
  site: 'https://sitedokai.com',
  redirects: siteRedirects,
  vite: {
    plugins: [tailwindcss()],
  },
  devToolbar: {
    enabled: false,
  },
  build: {
    inlineStylesheets: 'always',
  },
});
