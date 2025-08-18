import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: process.env.SITE || 'http://localhost:4321',
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    allowedHosts: ["hello-dont-questionnaire-electric.trycloudflare.com"],
  },

  output: 'server',
  adapter: netlify()
});