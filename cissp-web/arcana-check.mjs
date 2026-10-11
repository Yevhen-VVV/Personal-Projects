// Checks the Oracle's deck in bank/arcana, and optionally renders it.
//
//   node cissp-web/arcana-check.mjs                 validate every card
//   node cissp-web/arcana-check.mjs --render out.png   also draw all 22 cards (needs Playwright)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { loadArcana, loadBank } from "./bank.mjs";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));
const { cards, errors } = loadArcana();
const { questions } = loadBank();
for (const c of cards) {
  const n = questions.filter((q) => (c.objectives || []).includes(q.obj)).length;
  if (n < 8) errors.push(`${c.file} has only ${n} bank questions on its objectives; needs 8`);
}
const filled = cards.filter((c) => c.vision).length;
if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} problem(s); ${filled} of ${cards.length} cards have content.`);
} else console.log(`All ${cards.length} cards are valid.`);

const at = process.argv.indexOf("--render");
if (at > 0) {
  const out = process.argv[at + 1] || "arcana.png";
  const Engine = vm.runInNewContext(readFileSync(here("./src/engine.js"), "utf8") + "\nEngine;", { Math, Date });
  const tiles = cards.map((c) => `<figure>${Engine.cardSvg(c, { uid: "u" })}<figcaption>${c.n}. ${c.name}</figcaption></figure>`).join("")
    + `<figure>${Engine.cardSvg(cards[1], { reversed: true, uid: "r" })}<figcaption>reversed</figcaption></figure>`
    + `<figure>${Engine.cardSvg(null, { back: true })}<figcaption>back</figcaption></figure>`;
  const html = `<!doctype html><meta charset=utf8><style>body{margin:0;padding:16px;background:#222;display:grid;grid-template-columns:repeat(6,160px);gap:12px;font:12px sans-serif;color:#ddd}figure{margin:0}svg{width:160px;height:auto;display:block}</style>${tiles}`;
  const page = here(`./.arcana-preview-${process.pid}.html`);
  writeFileSync(page, html);
  const { createRequire } = await import("node:module");
  const require = createRequire("/node-tools/node_modules/");
  const { chromium } = require("playwright");
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const p = await browser.newPage({ viewport: { width: 1060, height: 900 }, deviceScaleFactor: 1.5 });
  await p.goto("file://" + page);
  await p.screenshot({ path: out, fullPage: true });
  await browser.close();
  const { unlinkSync } = await import("node:fs");
  unlinkSync(page);
  console.log("Rendered " + out);
}
if (errors.length) process.exit(1);
