// @ts-check
import { defineConfig } from 'astro/config';

// Keep `site` in step with `site.url` in src/config.ts.
export default defineConfig({
  site: 'https://threeticketstoadventure.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
});
