// Static audit of the built site: links, titles, descriptions, H1, canonical, JSON-LD, image alt, orphans.
// Run after `npm run build`: npm run audit
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const pages = [];
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) walk(p);
  else if (f.endsWith('.html')) pages.push(p);
});
walk(dist);

const toRoute = (file) => '/' + file.slice(dist.length + 1).split('\\').join('/').replace(/index\.html$/, '');

const problems = [];
const titles = new Map();
const descs = new Map();
const linked = new Set();
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const rel = toRoute(file);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (!title) problems.push(`${rel}: no title`);
  if (!desc) problems.push(`${rel}: no description`);
  if (h1s !== 1) problems.push(`${rel}: ${h1s} h1`);
  if (!html.includes('rel="canonical"')) problems.push(`${rel}: no canonical`);
  if (html.includes('\u2014')) problems.push(`${rel}: contains an em dash`);
  titles.set(title, [...(titles.get(title) || []), rel]);
  descs.set(desc, [...(descs.get(desc) || []), rel]);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { problems.push(`${rel}: invalid JSON-LD`); }
  }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt(="|[\s>])/.test(m[0])) problems.push(`${rel}: img without alt`);
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const href = m[1];
    if (href.startsWith('/_astro/') || /\.(svg|png|webmanifest|xml|txt)$/.test(href)) continue;
    linked.add(href);
    const target = href.endsWith('/') ? join(dist, href, 'index.html') : join(dist, href);
    if (!existsSync(target)) problems.push(`${rel}: broken link ${href}`);
  }
}
for (const [t, list] of titles) if (list.length > 1) problems.push(`duplicate title "${t}": ${list.join(', ')}`);
for (const [, list] of descs) if (list.length > 1) problems.push(`duplicate description: ${list.join(', ')}`);
const orphans = pages.map(toRoute)
  .filter((p) => p !== '/' && !p.endsWith('404.html') && !p.startsWith('/thank-you') && !linked.has(p));
if (orphans.length) problems.push(`orphan pages: ${orphans.join(', ')}`);

console.log(`${pages.length} pages checked`);
console.log(problems.length ? problems.join('\n') : 'No problems found');
process.exit(problems.length ? 1 : 0);
