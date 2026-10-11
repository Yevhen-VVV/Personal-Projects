// Tests for src/engine.js: the review scheduler, the smart session, the
// adaptive mock exam and the study plan.
//
//   node cissp-web/engine.test.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import assert from "node:assert/strict";
import { DOMAINS, loadBank } from "./bank.mjs";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));
// Objects created inside the sandbox have the sandbox's prototypes, so tests
// compare arrays with Array.from rather than directly.
const Engine = vm.runInNewContext(readFileSync(here("./src/engine.js"), "utf8") + "\nEngine;", { Math, Date });
const { questions } = loadBank();
const bank = questions.map((q) => ({ id: q.id, d: q.d, obj: q.obj, diff: q.diff, a: q.a }));

// A small deterministic random source, so failures can be reproduced.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const DAY = Engine.DAY;

test("a correct answer moves a question up a box and pushes its review out", () => {
  const now = 1_000_000;
  const r1 = Engine.record(null, true, now);
  assert.deepEqual(Array.from(r1.slice(0, 6)), [1, 1, 1, 1, now, 1]);
  assert.equal(r1[6], now + 1 * DAY);
  const r2 = Engine.record(r1, true, now + DAY);
  assert.equal(r2[5], 2);
  assert.equal(r2[6], now + DAY + 3 * DAY);
});

test("a miss sends a question back to box 1 for tomorrow and keeps the first-try result", () => {
  const now = 5_000_000;
  const r1 = Engine.record(null, true, now);
  const r2 = Engine.record(Engine.record(r1, true, now), false, now + 10);
  assert.equal(r2[0], 3);
  assert.equal(r2[1], 2);
  assert.equal(r2[2], 1, "first-try correctness never changes");
  assert.equal(r2[3], 0);
  assert.equal(r2[5], 1);
  assert.ok(r2[6] > now + 10 && r2[6] < now + 10 + DAY);
});

test("first-try accuracy is smoothed toward 60% for small samples", () => {
  const progress = { [bank[0].id]: Engine.record(null, true, 1) };
  const stats = Engine.domainStats(bank, progress, DOMAINS);
  const d = stats.find((s) => s.n === bank[0].d);
  assert.equal(d.seen, 1);
  assert.equal(d.firstRate, 1);
  assert.ok(d.smoothed > 0.6 && d.smoothed < 0.75);
});

test("readiness weights domains by exam weight", () => {
  const stats = DOMAINS.map((d) => ({ n: d.n, weight: d.weight, smoothed: d.n === 1 ? 1 : 0, seen: 1, total: 10 }));
  const r = Engine.readiness(stats);
  assert.ok(Math.abs(r.score - 0.16) < 1e-9);
});

test("a smart set has the requested size, no duplicates, and starts from due misses", () => {
  const now = 10 * DAY;
  const progress = {};
  const missed = bank.slice(0, 5).map((q) => q.id);
  for (const id of missed) progress[id] = Engine.record(null, false, now - 2 * DAY);
  const set = Engine.smartSet(bank, progress, DOMAINS, 20, { now, rnd: rng(1) });
  assert.equal(set.length, 20);
  assert.equal(new Set(set.map((q) => q.id)).size, 20);
  for (const id of missed) assert.ok(set.some((q) => q.id === id), `due miss ${id} included`);
});

test("a smart set limited to one domain stays in that domain", () => {
  const set = Engine.smartSet(bank, {}, DOMAINS, 15, { domains: [5], rnd: rng(2) });
  assert.equal(set.length, 15);
  assert.ok(set.every((q) => q.d === 5));
});

test("a smart set favors the domain you are weakest in", () => {
  const progress = {};
  const now = 100 * DAY;
  // Strong everywhere except D4, where every first try was wrong.
  for (const q of bank) {
    if (Math.random() < 0.5) continue;
    progress[q.id] = Engine.record(null, q.d !== 4, now - 50 * DAY);
    progress[q.id][6] = now + 30 * DAY; // nothing due
  }
  let d4 = 0, total = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const set = Engine.smartSet(bank, progress, DOMAINS, 30, { now, rnd: rng(seed) });
    d4 += set.filter((q) => q.d === 4).length;
    total += set.length;
  }
  assert.ok(d4 / total > 0.3, `D4 share ${(d4 / total).toFixed(2)} should be well above its 13% weight`);
});

test("review-only sets contain only due questions", () => {
  const now = 50 * DAY;
  const progress = {};
  progress[bank[0].id] = Engine.record(null, false, now - DAY * 2);
  progress[bank[1].id] = Engine.record(null, true, now); // not due
  const set = Engine.smartSet(bank, progress, DOMAINS, 40, { now, reviewOnly: true, rnd: rng(3) });
  assert.deepEqual(Array.from(set, (q) => q.id), [bank[0].id]);
});

test("ability estimate rises with correct answers and falls with misses", () => {
  const items = Array.from({ length: 40 }, () => ({ b: 0 }));
  const strong = Engine.estimate(items.map((r) => ({ ...r, correct: true })));
  const weak = Engine.estimate(items.map((r) => ({ ...r, correct: false })));
  const mixed = Engine.estimate(items.map((r, i) => ({ ...r, correct: i % 2 === 0 })));
  assert.ok(strong.theta > 1.5);
  assert.ok(weak.theta < -1.5);
  assert.ok(Math.abs(mixed.theta) < 0.2);
  assert.ok(mixed.se < 0.35);
});

test("the adaptive mock follows the exam's domain weights", () => {
  const form = Engine.FORMS.full;
  const used = [], responses = [];
  const r = rng(7);
  while (responses.length < form.max) {
    const q = Engine.nextCatItem(bank, used, responses, DOMAINS, {}, r);
    used.push(q.id);
    responses.push({ id: q.id, d: q.d, b: Engine.DIFFICULTY[q.diff], correct: r() < 0.7 });
  }
  for (const d of DOMAINS) {
    const share = responses.filter((x) => x.d === d.n).length / responses.length;
    assert.ok(Math.abs(share - d.weight / 100) < 0.02, `D${d.n} share ${share.toFixed(3)} vs ${d.weight}%`);
  }
  assert.equal(new Set(used).size, used.length, "no question repeats within a mock");
});

// Simulate candidates of known ability taking the full adaptive mock.
function simulate(trueTheta, seed) {
  const form = Engine.FORMS.full;
  const used = [], responses = [];
  const r = rng(seed);
  for (;;) {
    const q = Engine.nextCatItem(bank, used, responses, DOMAINS, {}, r);
    if (!q) return { n: responses.length, pass: Engine.estimate(responses).theta >= Engine.PASS_THETA };
    used.push(q.id);
    const b = Engine.DIFFICULTY[q.diff];
    responses.push({ id: q.id, d: q.d, b, correct: r() < Engine.prob(trueTheta, b) });
    const dec = Engine.catDecision(responses, form);
    if (dec.done) return { n: responses.length, pass: dec.pass };
  }
}

test("the adaptive mock passes strong candidates and fails weak ones", () => {
  const rate = (theta) => {
    let pass = 0, items = 0;
    for (let s = 1; s <= 60; s++) {
      const out = simulate(theta, s * 31 + Math.round(theta * 100));
      pass += out.pass ? 1 : 0;
      items += out.n;
    }
    return { pass: pass / 60, items: items / 60 };
  };
  const strong = rate(Engine.PASS_THETA + 0.9);
  const weak = rate(Engine.PASS_THETA - 0.9);
  const border = rate(Engine.PASS_THETA);
  assert.ok(strong.pass > 0.9, `strong pass rate ${strong.pass}`);
  assert.ok(weak.pass < 0.1, `weak pass rate ${weak.pass}`);
  assert.ok(border.pass > 0.2 && border.pass < 0.8, `borderline pass rate ${border.pass}`);
  assert.ok(strong.items >= 100 && strong.items < 125, `clear cases stop early: ${strong.items}`);
  assert.ok(border.items > strong.items, "borderline candidates need more items");
});

test("the scaled score puts the passing line at 700", () => {
  assert.equal(Engine.scaledScore(Engine.PASS_THETA), 700);
  assert.ok(Engine.scaledScore(Engine.PASS_THETA + 1) > 700);
  assert.equal(Engine.scaledScore(-10), 0);
  assert.equal(Engine.scaledScore(10), 1000);
});

test("the study plan ends with mock weeks and a final review week", () => {
  const now = new Date(2026, 9, 11).getTime();
  const exam = new Date(2026, 11, 31).getTime();
  const stats = Engine.domainStats(bank, {}, DOMAINS);
  const plan = Engine.studyPlan(exam, stats, {}, now);
  assert.equal(plan.weeks.length, Math.ceil((exam - now) / DAY / 7));
  assert.equal(plan.weeks.at(-1).phase, "final");
  assert.equal(plan.weeks.filter((w) => w.phase === "exam").length, 2);
  assert.ok(plan.weeks.slice(0, -3).every((w) => w.phase === "build" && w.focus.length === 2));
  assert.equal(Engine.studyPlan(now - DAY, stats, {}, now).weeks.length, 0);
});

test("a weak self-rating moves a domain earlier in the plan", () => {
  const stats = Engine.domainStats(bank, {}, DOMAINS);
  const base = Engine.domainPriority(stats, {}).sort((a, b) => b.p - a.p).map((p) => p.n);
  const rated = Engine.domainPriority(stats, { 8: 1 }).sort((a, b) => b.p - a.p).map((p) => p.n);
  assert.ok(rated.indexOf(8) < base.indexOf(8));
});

let failed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`ok   ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}\n     ${e.message}`);
  }
}
console.log(`\n${tests.length - failed}/${tests.length} passed`);
if (failed) process.exit(1);
