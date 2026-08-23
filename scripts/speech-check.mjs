/*
 * Checks what the app actually hands to the speech engine.
 *
 *   npm run build && (cd dist && python3 -m http.server 4182 &)
 *   npm run speech
 *
 * This exists because "read aloud" announced the answer the moment a question
 * appeared: auto-speak used the solved sentence. Nothing else caught it --
 * the text on screen was correct, only the audio was wrong.
 */
import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// Record every utterance handed to the speech engine, before the app runs.
await page.addInitScript(() => {
  window.__spoken = [];
  const orig = window.speechSynthesis?.speak?.bind(window.speechSynthesis);
  if (window.speechSynthesis) {
    window.speechSynthesis.speak = (u) => { window.__spoken.push(u.text); try { orig?.(u); } catch {} };
  }
});

await page.goto(process.argv[2] ?? 'http://localhost:4182/', { waitUntil: 'networkidle' });

// Turn "read aloud" on -- this is the path the bug was on.
await page.getByRole('button', { name: /Читать вслух/ }).click();
await page.getByRole('button', { name: /Начать сегодняшнее/ }).click();
await page.waitForTimeout(700);

const onScreen = (await page.locator('.sentence').first().textContent())?.trim();
const beforeAnswer = await page.evaluate(() => window.__spoken.slice());
console.log('sentence on screen :', onScreen);
console.log('spoken on appear   :', beforeAnswer);

const correctText = await page.locator('.choice').first().textContent();
await page.locator('.choice').first().click();
await page.waitForTimeout(700);
const afterAnswer = await page.evaluate(() => window.__spoken.slice());
console.log('spoken after answer:', afterAnswer.slice(beforeAnswer.length));

const leaked = beforeAnswer.some((t) => !/blank/i.test(t) && t.trim() !== '');
console.log(leaked ? '\nFAIL: pre-answer audio did not say "blank"' : '\nOK: pre-answer audio says "blank", answer only spoken after choosing');
await browser.close();
process.exitCode = leaked ? 1 : 0;
