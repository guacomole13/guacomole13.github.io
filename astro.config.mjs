// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    // Replace with your production URL before deploying
    site: 'https://michaelomole.com',
    base: '/',

    // Static output for Cloudflare Pages
    output: 'static',

    integrations: [sitemap()],

    vite: {
        plugins: [tailwindcss()],
    },
});
