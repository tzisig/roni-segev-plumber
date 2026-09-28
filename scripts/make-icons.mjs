// Generates favicon and app icons from the theme colors in site.config.ts (same mark as the Logo component).
// Run: npm run icons
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const cfg = readFileSync(new URL('../src/config/site.config.ts', import.meta.url), 'utf8');
const pick = (key) => cfg.match(new RegExp('[^A-Za-z]' + key + ": *'(#[0-9A-Fa-f]{6})'"))[1];
const ink = pick('ink');
const orange = pick('orange');
const name = cfg.match(/name:\s*'([^']+)'/)[1];
const shortName = cfg.match(/shortName:\s*'([^']+)'/)[1];

// pad shrinks the mark for maskable/app icons that need a safe zone
const svg = (pad = 0) => {
  const s = (48 - pad * 2) / 48;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="${pad ? 0 : 12}" fill="${ink}"/>
  <g transform="translate(${pad} ${pad}) scale(${s})">
    <path d="M12 38V22a8 8 0 0 1 8-8h16" fill="none" stroke="${orange}" stroke-width="7"/>
    <rect x="8" y="33" width="15" height="5" rx="1.5" fill="${orange}"/>
    <rect x="31" y="9.5" width="5" height="15" rx="1.5" fill="${orange}"/>
    <path d="M36 29c0 0-4 4.4-4 7a4 4 0 0 0 8 0c0-2.6-4-7-4-7z" fill="#7CC3FF"/>
  </g>
</svg>`;
};

writeFileSync('public/favicon.svg', svg());
const out = [
  ['public/favicon-32.png', 32, 0],
  ['public/apple-touch-icon.png', 180, 5],
  ['public/icon-192.png', 192, 5],
  ['public/icon-512.png', 512, 5],
];
for (const [file, size, pad] of out) {
  await sharp(Buffer.from(svg(pad))).resize(size, size).png().toFile(file);
}
writeFileSync('public/site.webmanifest', JSON.stringify({
  name, short_name: shortName, lang: 'he', dir: 'rtl', start_url: '/', display: 'standalone',
  background_color: ink, theme_color: ink,
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
}, null, 2));
console.log('icons written');
