import type { APIRoute } from 'astro';
import { site } from '../config/site.config';

// Built from the config so the sitemap URL always matches site.url.
// In demo mode pages carry noindex; crawling stays allowed so search engines can see it.
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /thank-you/

# AI crawlers are allowed, so the business can be cited in AI search answers.
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${site.url}/sitemap-index.xml
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
