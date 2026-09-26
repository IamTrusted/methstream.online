// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// https://astro.build/config
const { PUBLIC_BASE_URL } = loadEnv(process.cwd(), process.env.NODE_ENV || 'development', '');
const siteUrl = PUBLIC_BASE_URL || 'https://methstream.online';

export default defineConfig({
  site: siteUrl,
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: false
    }
  }),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});
