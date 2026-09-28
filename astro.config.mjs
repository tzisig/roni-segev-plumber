import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

// The site URL lives in src/config/site.config.ts. It is read here with a regex so the
// config stays the only place to change it, without importing image assets into this file.
const configSource = readFileSync(new URL('./src/config/site.config.ts', import.meta.url), 'utf8');
const siteUrl = configSource.match(/url:\s*'([^']+)'/)[1];

export default defineConfig({
  site: siteUrl,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you/') && !page.includes('/404'),
    }),
  ],
});
