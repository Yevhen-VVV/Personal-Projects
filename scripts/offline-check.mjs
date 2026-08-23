/*
 * Checks that the app really works with the network off.
 *
 *   BASE_PATH=/Personal-Projects npm run build
 *   mkdir -p /tmp/pages/Personal-Projects && cp -r dist/* /tmp/pages/Personal-Projects/
 *   (cd /tmp/pages && python3 -m http.server 4181 &)
 *   npm run offline
 *
 * This exists because a hand-written service worker passed every other check
 * and still opened blank offline: it precached the shell, but the hashed JS and
 * CSS are fetched before the worker activates, so they were never cached.
 * Nothing short of actually loading the page with the network cut catches that.
 */
import { chromium } from 'playwright';
const URL_ = process.argv[2] ?? 'http://localhost:4181/Personal-Projects/';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const bad = [];
page.on('response', (r) => { if (!r.ok() && !r.url().endsWith('/favicon.ico')) bad.push(`${r.status()} ${r.url()}`); });

await page.goto(URL_, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const sw = await page.evaluate(async () => {
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? { scope: reg.scope, active: !!reg.active } : null;
});
console.log('service worker:', sw);
console.log('manifest link:', await page.getAttribute('link[rel=manifest]', 'href'));
console.log('bad responses on first load:', bad.length ? bad : 'none');

// The point of deploying the directory rather than one file: it must still
// open with the network gone.
await ctx.setOffline(true);
const page2 = await ctx.newPage();
const offlineErrors = [];
page2.on('pageerror', (e) => offlineErrors.push(e.message));
await page2.goto(URL_, { waitUntil: 'domcontentloaded' });
await page2.waitForTimeout(1200);
const heading = await page2.locator('h1').first().textContent().catch(() => null);
console.log('OFFLINE heading:', heading);
const startBtn = await page2.getByRole('button', { name: /Начать сегодняшнее/ }).count();
console.log('OFFLINE start button present:', startBtn > 0);
if (startBtn > 0) {
  await page2.getByRole('button', { name: /Начать сегодняшнее/ }).click();
  await page2.waitForTimeout(600);
  console.log('OFFLINE choices rendered:', await page2.locator('.choice').count());
}
console.log('offline page errors:', offlineErrors.length ? offlineErrors : 'none');

const ok = sw?.active && heading && startBtn > 0 && !bad.length && !offlineErrors.length;
console.log(ok ? '\nOFFLINE OK' : '\nOFFLINE FAILED');
await browser.close();
process.exitCode = ok ? 0 : 1;
