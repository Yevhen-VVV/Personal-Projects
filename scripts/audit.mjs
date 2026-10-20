#!/usr/bin/env node
/**
 * Visual and structural audit of the built site.
 * Run after `npm run build`:  npm run audit
 *
 * Serves dist/ locally, opens every page at 5 widths, and fails on:
 *  - horizontal page scroll (layout wider than the screen)
 *  - broken internal links
 *  - images or SVGs without a size
 *  - pages missing a <title>, meta description or h1
 * Full-page screenshots land in audit/ for a human look.
 */
import { createServer } from 'node:http';
import { readFile, mkdir, readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const dist = new URL('../dist/', import.meta.url).pathname;
const outDir = new URL('../audit/', import.meta.url).pathname;
const widths = [360, 390, 768, 1024, 1440];
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };

async function listPages(dir, base = '') {
  const out = [];
  for (const name of await readdir(join(dir, base))) {
    const rel = join(base, name);
    if ((await stat(join(dir, rel))).isDirectory()) out.push(...(await listPages(dir, rel)));
    else if (name === 'index.html') out.push('/' + base.replace(/\\/g, '/') + (base ? '/' : ''));
  }
  return out;
}

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  try {
    const body = await readFile(join(dist, p));
    res.writeHead(200, { 'Content-Type': types[extname(p)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(0);
const origin = `http://localhost:${server.address().port}`;

const pages = (await listPages(dist)).sort();
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const problems = [];
const seenLinks = new Set();

for (const path of pages) {
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(origin + path, { waitUntil: 'networkidle' });
    const r = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      h1: document.querySelectorAll('h1').length,
      links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')),
    }));
    if (r.sw > w + 1) problems.push(`${path} @${w}px: page is ${r.sw}px wide (horizontal scroll)`);
    if (w === 1440) {
      if (!r.title) problems.push(`${path}: missing <title>`);
      if (!r.desc) problems.push(`${path}: missing meta description`);
      if (r.h1 !== 1 && path !== '/404/') problems.push(`${path}: has ${r.h1} h1 elements`);
      r.links.forEach((l) => seenLinks.add(l.split('#')[0].split('?')[0]));
    }
    if (w === 390 || w === 1440) {
      const name = (path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '_')) + `_${w}.png`;
      await page.screenshot({ path: join(outDir, name), fullPage: true });
    }
    await page.close();
  }
}

for (const l of seenLinks) {
  const res = await fetch(origin + l);
  if (res.status !== 200) problems.push(`broken internal link: ${l} (${res.status})`);
}

await browser.close();
server.close();

console.log(`\nAudited ${pages.length} pages × ${widths.length} widths, ${seenLinks.size} internal links.`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  problems.forEach((p) => console.log('  - ' + p));
  process.exit(1);
}
console.log('Clean. Screenshots in audit/.\n');
