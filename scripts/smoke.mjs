/*
 * End-to-end smoke test against a built app.
 *
 *   npm run build && npx vite preview --port 4174 &
 *   npm run smoke -- ./screenshots
 *
 * Walks a full session at an iPhone viewport, then re-checks the two settings
 * most likely to break a layout -- largest text and the dark background --
 * asserting no horizontal scroll and no tap target under 44px.
 */
import { chromium } from 'playwright';
const out = process.argv[2] ?? '.';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
// iPhone-sized viewport: this is the primary target, so it is what we check.
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

await page.goto('http://localhost:4174/', { waitUntil: 'networkidle' });
await page.screenshot({ path: `${out}/01-home.png`, fullPage: true });

await page.getByRole('button', { name: /Начать сегодняшнее/ }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/02-question.png`, fullPage: true });

// Answer the first question, then capture the feedback state.
const choices = page.locator('.choice');
console.log('choices on Q1:', await choices.count());
await choices.first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/03-feedback.png`, fullPage: true });

// Walk the whole session to make sure nothing breaks partway through.
for (let i = 0; i < 20; i++) {
  const next = page.getByRole('button', { name: /Следующий вопрос|Посмотреть результат/ });
  if (!(await next.count())) break;
  const label = await next.textContent();
  await next.click();
  await page.waitForTimeout(150);
  if (label?.includes('результат')) break;
  const c = page.locator('.choice');
  if (await c.count()) await c.nth(0).click();
  await page.waitForTimeout(120);
}
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/04-results.png`, fullPage: true });

await page.getByRole('button', { name: 'Завершить' }).click();
await page.waitForTimeout(200);
await page.getByRole('button', { name: 'Выбрать тему' }).click();
await page.waitForTimeout(200);
await page.screenshot({ path: `${out}/05-topics.png`, fullPage: true });
await page.locator('.stack button').first().click();
await page.waitForTimeout(200);
await page.screenshot({ path: `${out}/06-lesson.png`, fullPage: true });

// Accessibility settings, checked on a live question rather than the home page.
await page.getByRole('button', { name: 'Завершить' }).count().catch(() => {});
await page.goto('http://localhost:4174/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Самый крупный' }).click();
await page.getByRole('button', { name: /Тёмный фон/ }).click();
await page.getByRole('button', { name: /Начать сегодняшнее/ }).click();
await page.waitForTimeout(400);
await page.locator('.choice').first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/07-dark-largest.png`, fullPage: true });

const box = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
}));
if (box.scrollW > box.clientW) errors.push(`horizontal overflow: ${box.scrollW} > ${box.clientW}`);

const small = await page.evaluate(() =>
  [...document.querySelectorAll('button')]
    .map((b) => ({ text: b.textContent.slice(0, 24), height: Math.round(b.getBoundingClientRect().height) }))
    .filter((b) => b.height < 44));
if (small.length) errors.push(`tap targets under 44px: ${JSON.stringify(small)}`);

console.log('ERRORS:', errors.length ? errors : 'none');
await browser.close();
process.exitCode = errors.length ? 1 : 0;
