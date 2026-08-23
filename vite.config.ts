import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * GitHub Pages serves a project repository from a subdirectory (`/<repo>/`),
 * not from the domain root, so the build needs to know its base path.
 * BASE_PATH is set by the deploy workflow; locally it stays "/".
 */
// configure-pages reports "/Personal-Projects" for a project repo and "/" for
// a user site, so normalise to exactly one trailing slash either way.
const base = `/${(process.env.BASE_PATH ?? '/').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');

export default defineConfig({
  base,
  plugins: [
    react(),
    /**
     * Offline support.
     *
     * A hand-written service worker looked like it worked and did not: it
     * precached the shell, but the hashed JS and CSS are fetched before the
     * worker activates on a first visit, so they were never cached and the
     * app opened blank with no network. Workbox generates a precache manifest
     * at build time from the actual emitted filenames, which is the part that
     * cannot be written by hand.
     */
    VitePWA({
      registerType: 'autoUpdate',
      // Registration is done by hand in main.tsx so the single-file build can
      // opt out of it -- there is no separate sw.js beside that one.
      injectRegister: null,
      includeAssets: ['favicon-32.png', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webmanifest}'],
        cleanupOutdatedCaches: true,
        navigateFallback: `${base}index.html`,
      },
      manifest: {
        name: 'Английский язык',
        short_name: 'Английский',
        description: 'Уроки английского языка и упражнения с неограниченным числом заданий.',
        // Relative, so the same manifest works at the root or in a subdirectory.
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#faf8f4',
        theme_color: '#12557f',
        lang: 'ru',
        categories: ['education'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
