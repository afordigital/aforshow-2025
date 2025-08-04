import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: process.env.SITE || 'http://localhost:4321',
  vite: {
    plugins: [tailwindcss()],
  },

  output: 'server',
  adapter: netlify()
});