/*
 * Drives the three speaking/listening features in a real browser.
 *
 *   npm run build && (cd dist && python3 -m http.server 4190 &)
 *   npm run features
 *
 * Speech recognition does not exist in headless Chromium, so it is stubbed
 * with a fake that replays a scripted transcript. That is the point: the stub
 * lets us prove the screens handle a real transcript, an empty one, and a
 * missing microphone, none of which we could trigger by hand on a phone.
 */
import { chromium } from 'playwright';

const URL_ = process.argv[2] ?? 'http://localhost:4190/';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error' && !/404|favicon/i.test(m.text())) errors.push('console: ' + m.text());
});

// Fake recognition + capture every utterance spoken, with its rate.
await page.addInitScript(() => {
  window.__spoken = [];
  const synth = window.speechSynthesis;
  if (synth) {
    const orig = synth.speak.bind(synth);
    synth.speak = (u) => {
      window.__spoken.push({ text: u.text, rate: u.rate });
      // Headless has no voices, so onend never fires; call it so screens advance.
      setTimeout(() => u.onend?.(), 30);
      try { orig(u); } catch { /* no voices */ }
    };
  }
  window.__saidNext = '';
  class FakeRecognition extends EventTarget {
    constructor() { super(); this.lang = ''; this.continuous = false; this.interimResults = false; this.maxAlternatives = 1; }
    start() {
      setTimeout(() => {
        const text = window.__saidNext;
        if (text) {
          this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: text }], { isFinal: true })] });
        }
      }, 20);
    }
    stop() { setTimeout(() => this.onend?.(), 10); }
    abort() { this.stop(); }
  }
  window.SpeechRecognition = FakeRecognition;
  window.webkitSpeechRecognition = FakeRecognition;
});

const step = async (label, fn) => {
  try { await fn(); console.log(`  ok   ${label}`); }
  catch (e) { console.log(`  FAIL ${label}: ${e.message}`); errors.push(`${label}: ${e.message}`); }
};

await page.goto(URL_, { waitUntil: 'networkidle' });

console.log('ROLE-PLAY');
await step('opens from the home screen', async () => {
  await page.getByRole('button', { name: /Разговор/ }).first().click();
  await page.getByRole('button', { name: 'Запись к врачу' }).click();
  await page.getByRole('button', { name: 'Начать разговор' }).click();
  await page.waitForSelector('.speech-bubble');
});

await step('the partner speaks the opening line', async () => {
  const spoken = await page.evaluate(() => window.__spoken.map((s) => s.text));
  if (!spoken.some((t) => t.includes('How can I help you'))) throw new Error(`spoke: ${JSON.stringify(spoken)}`);
});

await step('never shows a correction mid-conversation', async () => {
  await page.evaluate(() => { window.__saidNext = 'complete nonsense here'; });
  await page.getByRole('button', { name: /Нажмите и говорите/ }).click();
  await page.waitForTimeout(120);
  await page.getByRole('button', { name: /Я закончила/ }).click();
  await page.waitForTimeout(200);
  if (await page.locator('.verdict').count()) throw new Error('a verdict appeared mid-conversation');
  const turn = await page.locator('.topbar span').textContent();
  if (!turn.includes('2 из')) throw new Error(`did not advance after a wrong answer: ${turn}`);
});

await step('the escape hatch shows the phrase in both languages', async () => {
  await page.getByRole('button', { name: 'Не знаю, что сказать' }).click();
  await page.waitForSelector('.phrase-en');
  const en = await page.locator('.phrase-en').textContent();
  const ru = await page.locator('.phrase-ru').textContent();
  if (!en.trim() || !ru.trim()) throw new Error('help panel incomplete');
  await page.getByRole('button', { name: 'Продолжить' }).click();
});

await step('silence still advances the turn', async () => {
  await page.evaluate(() => { window.__saidNext = ''; });
  await page.getByRole('button', { name: /Нажмите и говорите/ }).click();
  await page.waitForTimeout(120);
  await page.getByRole('button', { name: /Я закончила/ }).click();
  await page.waitForTimeout(200);
  const turn = await page.locator('.topbar span').textContent();
  if (!turn.includes('3 из')) throw new Error(`silence did not advance: ${turn}`);
});

await step('reaches the review, and only there shows corrections', async () => {
  for (let i = 0; i < 4; i++) {
    if (!(await page.getByRole('button', { name: /Нажмите и говорите/ }).count())) break;
    await page.evaluate(() => { window.__saidNext = 'yes thank you'; });
    await page.getByRole('button', { name: /Нажмите и говорите/ }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /Я закончила/ }).click();
    await page.waitForTimeout(180);
  }
  await page.waitForSelector('.review-row', { timeout: 3000 });
  const rows = await page.locator('.review-row').count();
  if (rows !== 5) throw new Error(`expected 5 reviewed turns, got ${rows}`);
});

console.log('LISTENING');
await step('runs all four passes at natural speed', async () => {
  await page.getByRole('button', { name: 'Другая ситуация' }).click();
  await page.getByRole('button', { name: '← Назад' }).click();
  await page.getByRole('button', { name: /Аудирование/ }).first().click();
  await page.getByRole('button', { name: 'Прогноз погоды' }).click();

  for (let pass = 1; pass <= 4; pass++) {
    await page.getByRole('button', { name: /Слушать|Ещё раз/ }).first().click();
    await page.waitForTimeout(250);
    // Answer every question on this pass.
    for (let q = 0; q < 4; q++) {
      if (!(await page.locator('.choice').count())) break;
      await page.locator('.choice').first().click();
      await page.waitForTimeout(120);
      const next = page.getByRole('button', { name: /Следующий вопрос|Готово, дальше/ });
      if (await next.count()) { await next.first().click(); await page.waitForTimeout(150); }
    }
    const ready = page.getByRole('button', { name: 'Готово, дальше' });
    if (await ready.count()) { await ready.first().click(); await page.waitForTimeout(150); }
  }
  await page.waitForSelector('text=Запись пройдена', { timeout: 4000 });
});

await step('played the audio at natural rate, not the slow teaching rate', async () => {
  const rates = await page.evaluate(() =>
    window.__spoken.filter((s) => s.text.includes('weather for the week')).map((s) => s.rate));
  if (!rates.length) throw new Error('the passage was never played');
  if (!rates.every((r) => r === 1)) throw new Error(`expected rate 1, got ${JSON.stringify(rates)}`);
});

console.log('PHRASES');
await step('daily drill runs and scores a good repeat', async () => {
  await page.getByRole('button', { name: 'Другая запись' }).click();
  await page.getByRole('button', { name: '← Назад' }).click();
  await page.getByRole('button', { name: /Нужные фразы/ }).first().click();
  await page.getByRole('button', { name: 'Сегодняшняя тренировка' }).click();
  await page.waitForSelector('.phrase-en');

  const target = await page.locator('.phrase-en').textContent();
  await page.evaluate((t) => { window.__saidNext = t; }, target);
  await page.getByRole('button', { name: /Повторить$/ }).first().click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: /Готово$/ }).first().click();
  await page.waitForTimeout(250);
  const verdict = await page.locator('.verdict h3').textContent();
  if (!/Отлично/.test(verdict)) throw new Error(`expected praise for an exact repeat, got: ${verdict}`);
});

await step('a poor repeat is told to try again, not marked correct', async () => {
  await page.getByRole('button', { name: 'Дальше' }).click();
  await page.waitForTimeout(200);
  await page.evaluate(() => { window.__saidNext = 'something entirely different'; });
  await page.getByRole('button', { name: /Повторить$/ }).first().click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: /Готово$/ }).first().click();
  await page.waitForTimeout(250);
  const verdict = await page.locator('.verdict h3').textContent();
  if (!/не совсем/i.test(verdict)) throw new Error(`expected a retry prompt, got: ${verdict}`);
});

const overflow = await page.evaluate(() => ({
  s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
if (overflow.s > overflow.c) errors.push(`horizontal overflow: ${overflow.s} > ${overflow.c}`);

console.log('\nERRORS:', errors.length ? errors : 'none');
await browser.close();
process.exitCode = errors.length ? 1 : 0;
