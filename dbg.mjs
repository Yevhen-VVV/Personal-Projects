import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const host = await browser.newPage({ viewport: { width: 390, height: 844 } });
await host.route(/^http:\/\/localhost:4199\//, (r) =>
  r.fulfill({ contentType: 'text/html', body: `<!doctype html><meta charset="utf8"><iframe src="http://localhost:4191/" style="width:100%;height:780px;border:0"></iframe>` }));
await host.goto('http://localhost:4199/', { waitUntil: 'domcontentloaded' });
await host.waitForTimeout(2500);
console.log('frames:', host.frames().map((f) => f.url()));
const child = host.frames().find((f) => f !== host.mainFrame());
if (child) console.log('buttons:', await child.evaluate(() => [...document.querySelectorAll('button')].map(b=>b.textContent.trim().slice(0,26)).slice(0,8)));
await browser.close();
