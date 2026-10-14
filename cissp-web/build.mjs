// Builds the single-file app, cissp-web/cissp-prep.html, from the page
// template, the engine, the question bank, the Arcade drills and the Oracle's deck.
//
//   node cissp-web/build.mjs           write cissp-prep.html and print bank statistics
//   node cissp-web/build.mjs --check   fail if cissp-prep.html is out of date
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DOMAINS, loadArcana, loadBank, loadDrills, report } from "./bank.mjs";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

const { questions, errors: bankErrors } = loadBank();
const { drills, errors: drillErrors } = loadDrills();
const { cards, errors: arcanaErrors } = loadArcana();
for (const c of cards) {
  const n = questions.filter((q) => (c.objectives || []).includes(q.obj)).length;
  if (n < 8) arcanaErrors.push(`${c.file} has only ${n} bank questions on its objectives; needs 8`);
}
// --draft builds a preview while the deck is being written: deck problems
// become warnings, and unfinished cards appear with whatever they have.
const draft = process.argv.includes("--draft");
if (draft && arcanaErrors.length) console.warn(`Draft build: ${arcanaErrors.length} deck problem(s) ignored.`);
const errors = bankErrors.concat(drillErrors, draft ? [] : arcanaErrors);
if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} problem(s) in the question bank.`);
  process.exit(1);
}

const template = readFileSync(here("./src/app.html"), "utf8");
const engine = readFileSync(here("./src/engine.js"), "utf8");

const bank = {
  outline: "CISSP exam outline effective April 15, 2024",
  domains: DOMAINS,
  questions: questions.map((q) => ({
    id: q.id, d: q.d, obj: q.obj, diff: q.diff, q: q.q,
    o: q.options.map((o) => [o.t, o.why]),
    a: q.a, k: q.takeaway,
  })),
  drills,
  arcana: cards.map((c) => {
    const card = { ...c };
    delete card.file;
    return card;
  }),
};

// Inside a <script> element, "</" could end the element early, so it is escaped in the JSON.
const bankJSON = JSON.stringify(bank).replace(/</g, "\\u003c");

for (const placeholder of ["__BANK__", "/*__ENGINE__*/"]) {
  if (template.split(placeholder).length !== 2) throw new Error(`Template must contain ${placeholder} exactly once`);
}

const header = "<!-- Generated file: edit the sources, not this one. -->\n";
// Placed after the <title> so the title stays within the first lines of the file.
const [titleLine, ...rest] = template.split("\n");
const output = [titleLine, header + rest.join("\n")].join("\n")
  .replace("__BANK__", () => bankJSON)
  .replace("/*__ENGINE__*/", () => engine.trim());

const target = here("./cissp-prep.html");
if (process.argv.includes("--check")) {
  let current = "";
  try { current = readFileSync(target, "utf8"); } catch { /* missing counts as out of date */ }
  if (current !== output) {
    console.error("cissp-web/cissp-prep.html is out of date. Run: node cissp-web/build.mjs");
    process.exit(1);
  }
  console.log("cissp-prep.html is up to date");
} else {
  writeFileSync(target, output);
  const r = report(questions);
  console.log(`Wrote cissp-web/cissp-prep.html (${(output.length / 1024).toFixed(0)} KB), ${r.total} questions`);
  for (const d of r.perDomain) {
    const share = r.total ? ((100 * d.count) / r.total).toFixed(1) : "0";
    console.log(`  D${d.n}  ${String(d.count).padStart(3)}  ${share.padStart(4)}% of bank  (exam weight ${d.weight}%)`);
  }
  console.log(`  keyed answer position A/B/C/D: ${r.positions.join(" / ")}`);
  console.log(`  keyed answer is the single longest option: ${(r.longestShare * 100).toFixed(0)}%`);
  console.log(`  difficulty easy/medium/hard: ${r.byDiff.join(" / ")}`);
  console.log(`  drills: ${drills.sequences.length} sequences, ${drills.matches.length} match sets`);
  console.log(`  oracle: ${bank.arcana.filter((c) => c.vision).length} of 22 cards written`);
}
