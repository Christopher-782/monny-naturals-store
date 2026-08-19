const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = (process.env.SITE_URL || 'https://www.monnynatural.com').replace(/\/$/, '');
const CONTENT_FILE = path.join(ROOT, 'data', 'content.json');
const OUTPUT_FILE = path.join(ROOT, 'client', 'public', 'sitemap.xml');

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
const urls = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/products', priority: '0.9', changefreq: 'weekly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
];

for (const category of content.categories || []) {
  if (!category?.name) continue;
  urls.push({
    path: `/category/${encodeURIComponent(category.name)}`,
    priority: '0.8',
    changefreq: 'weekly',
  });
}

for (const product of content.products || []) {
  if (product?.id === undefined || product?.id === null) continue;
  urls.push({
    path: `/products/${encodeURIComponent(product.id)}`,
    priority: '0.8',
    changefreq: 'weekly',
  });
}

const lastmod = new Date().toISOString().slice(0, 10);
const body = urls
  .map(
    (item) => `  <url>\n    <loc>${xmlEscape(`${SITE_URL}${item.path}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${item.changefreq}</changefreq>\n    <priority>${item.priority}</priority>\n  </url>`,
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
fs.writeFileSync(OUTPUT_FILE, xml);
console.log(`Generated sitemap with ${urls.length} URLs at ${OUTPUT_FILE}`);
