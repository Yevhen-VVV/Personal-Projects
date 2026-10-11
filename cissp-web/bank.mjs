// Reads the plain-text question files in cissp-web/bank and checks them.
//
// One question per block:
//
//   ## D3-014 | 3.6 | 2
//   Q: The stem. It may run over
//   several lines.
//   A) A wrong option
//   = Why it is wrong.
//   B)* The keyed answer (the asterisk marks it)
//   = Why it is right.
//   C) ...
//   = ...
//   D) ...
//   = ...
//   >> The one-line takeaway shown after answering.
//
// The header is: id | outline objective | difficulty (1 easy, 2 medium, 3 hard).
// Ids are permanent: progress is stored against them, so never renumber a question.
// A line starting with "# " is a comment.
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

// The April 15, 2024 CISSP exam outline: domains, weights and objectives.
export const DOMAINS = [
  { n: 1, name: "Security and Risk Management", short: "Risk & governance", weight: 16, objectives: {
    "1.1": "Professional ethics",
    "1.2": "Security concepts (CIA, authenticity, nonrepudiation)",
    "1.3": "Security governance principles",
    "1.4": "Legal, regulatory and compliance issues",
    "1.5": "Investigation types",
    "1.6": "Policies, standards, procedures and guidelines",
    "1.7": "Business continuity requirements",
    "1.8": "Personnel security",
    "1.9": "Risk management concepts",
    "1.10": "Threat modeling",
    "1.11": "Supply chain risk management",
    "1.12": "Security awareness, education and training",
  } },
  { n: 2, name: "Asset Security", short: "Asset security", weight: 10, objectives: {
    "2.1": "Identify and classify information and assets",
    "2.2": "Information and asset handling requirements",
    "2.3": "Provision information and assets securely",
    "2.4": "Data lifecycle",
    "2.5": "Asset retention (EOL, EOS)",
    "2.6": "Data security controls and compliance requirements",
  } },
  { n: 3, name: "Security Architecture and Engineering", short: "Architecture & crypto", weight: 13, objectives: {
    "3.1": "Secure design principles",
    "3.2": "Security models",
    "3.3": "Select controls from system requirements",
    "3.4": "Security capabilities of information systems",
    "3.5": "Vulnerabilities of architectures and solution elements",
    "3.6": "Cryptographic solutions",
    "3.7": "Cryptanalytic attacks",
    "3.8": "Site and facility design principles",
    "3.9": "Site and facility security controls",
    "3.10": "Information system lifecycle",
  } },
  { n: 4, name: "Communication and Network Security", short: "Networks", weight: 13, objectives: {
    "4.1": "Secure network architecture design",
    "4.2": "Secure network components",
    "4.3": "Secure communication channels",
  } },
  { n: 5, name: "Identity and Access Management", short: "Identity & access", weight: 13, objectives: {
    "5.1": "Physical and logical access to assets",
    "5.2": "Identification and authentication strategy",
    "5.3": "Federated identity with a third party",
    "5.4": "Authorization mechanisms",
    "5.5": "Identity and access provisioning lifecycle",
    "5.6": "Authentication systems",
  } },
  { n: 6, name: "Security Assessment and Testing", short: "Assessment & testing", weight: 12, objectives: {
    "6.1": "Assessment, test and audit strategies",
    "6.2": "Security control testing",
    "6.3": "Security process data",
    "6.4": "Test output and reporting",
    "6.5": "Security audits",
  } },
  { n: 7, name: "Security Operations", short: "Security operations", weight: 13, objectives: {
    "7.1": "Investigations",
    "7.2": "Logging and monitoring",
    "7.3": "Configuration management",
    "7.4": "Foundational security operations concepts",
    "7.5": "Resource protection",
    "7.6": "Incident management",
    "7.7": "Detection and preventive measures",
    "7.8": "Patch and vulnerability management",
    "7.9": "Change management",
    "7.10": "Recovery strategies",
    "7.11": "Disaster recovery processes",
    "7.12": "Testing disaster recovery plans",
    "7.13": "Business continuity planning and exercises",
    "7.14": "Physical security",
    "7.15": "Personnel safety and security",
  } },
  { n: 8, name: "Software Development Security", short: "Software security", weight: 10, objectives: {
    "8.1": "Security in the SDLC",
    "8.2": "Controls in development ecosystems",
    "8.3": "Effectiveness of software security",
    "8.4": "Security impact of acquired software",
    "8.5": "Secure coding guidelines and standards",
  } },
];

const HEADER = /^##\s+(D([1-8])-\d{3})\s*\|\s*(\d\.\d{1,2})\s*\|\s*([123])\s*$/;
const OPTION = /^([A-D])\)(\*)?\s+(.+)$/;

export function parseBank(text, file = "bank") {
  const questions = [];
  const errors = [];
  let q = null;
  let mode = null; // "stem" | "option"
  const lines = text.split(/\r?\n/);

  const finish = () => {
    if (q) questions.push(q);
    q = null;
    mode = null;
  };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    const where = `${file}:${i + 1}`;
    if (line.startsWith("## ")) {
      finish();
      const m = HEADER.exec(line);
      if (!m) {
        errors.push(`${where} bad header: ${line}`);
        return;
      }
      q = { id: m[1], d: Number(m[2]), obj: m[3], diff: Number(m[4]), q: "", options: [], a: -1, takeaway: "", where };
      return;
    }
    if (line.startsWith("# ") || line === "#") return;
    if (!line.trim()) return;
    if (!q) {
      errors.push(`${where} text outside a question: ${line}`);
      return;
    }
    const text = line.trim();
    if (text.startsWith("Q:")) {
      q.q = text.slice(2).trim();
      mode = "stem";
      return;
    }
    const opt = OPTION.exec(text);
    if (opt) {
      const letter = "ABCD".indexOf(opt[1]);
      if (letter !== q.options.length) errors.push(`${where} ${q.id} options out of order`);
      if (opt[2]) {
        if (q.a !== -1) errors.push(`${where} ${q.id} has more than one keyed answer`);
        q.a = q.options.length;
      }
      q.options.push({ t: opt[3].trim(), why: "" });
      mode = "option";
      return;
    }
    if (text.startsWith("=")) {
      const last = q.options[q.options.length - 1];
      if (!last) errors.push(`${where} ${q.id} explanation before any option`);
      else last.why = (last.why ? last.why + " " : "") + text.slice(1).trim();
      return;
    }
    if (text.startsWith(">>")) {
      q.takeaway = (q.takeaway ? q.takeaway + " " : "") + text.slice(2).trim();
      mode = "takeaway";
      return;
    }
    if (mode === "stem") {
      q.q += "\n" + text;
      return;
    }
    errors.push(`${where} ${q.id} unexpected line: ${text}`);
  });
  finish();
  return { questions, errors };
}

// Problems that would mislead a learner. Each one fails the build.
export function validate(questions) {
  const errors = [];
  const seenIds = new Set();
  const seenStems = new Map();
  for (const q of questions) {
    const tag = `${q.where} ${q.id}`;
    if (seenIds.has(q.id)) errors.push(`${tag} duplicate id`);
    seenIds.add(q.id);
    const stemKey = q.q.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seenStems.has(stemKey)) errors.push(`${tag} same stem as ${seenStems.get(stemKey)}`);
    seenStems.set(stemKey, q.id);
    const domain = DOMAINS[q.d - 1];
    if (!domain.objectives[q.obj]) errors.push(`${tag} objective ${q.obj} is not in domain ${q.d}`);
    if (!q.q) errors.push(`${tag} has no stem`);
    if (q.options.length !== 4) errors.push(`${tag} has ${q.options.length} options, expected 4`);
    if (q.a < 0) errors.push(`${tag} has no keyed answer`);
    if (!q.takeaway) errors.push(`${tag} has no takeaway`);
    const texts = new Set();
    q.options.forEach((o, i) => {
      if (!o.why) errors.push(`${tag} option ${"ABCD"[i]} has no explanation`);
      if (texts.has(o.t.toLowerCase())) errors.push(`${tag} option ${"ABCD"[i]} repeats another option`);
      texts.add(o.t.toLowerCase());
      // Options are shuffled on screen, so an option must never point at another by position.
      if (/\b(all|none|both) of the above\b|\boptions? [A-D]\b|\b[A-D] and [A-D]\b/i.test(o.t)) {
        errors.push(`${tag} option ${"ABCD"[i]} depends on option order: ${o.t}`);
      }
      const opener = o.why.split(/[ .,:;]/)[0].toLowerCase();
      // Every keyed explanation in this bank opens with "Correct.", which catches an asterisk on the wrong option.
      if (i === q.a && !/^Correct\b/.test(o.why)) errors.push(`${tag} keyed answer's explanation does not open with "Correct."`);
      if (i !== q.a && ["correct", "right", "yes"].includes(opener)) errors.push(`${tag} distractor ${"ABCD"[i]} is explained as right`);
    });
  }
  return errors;
}

// Statistics a test writer should watch: answer position, and whether the
// keyed answer gives itself away by being the longest option.
export function report(questions) {
  const perDomain = DOMAINS.map((d) => ({ n: d.n, weight: d.weight, count: questions.filter((q) => q.d === d.n).length }));
  const positions = [0, 0, 0, 0];
  let longest = 0;
  for (const q of questions) {
    positions[q.a]++;
    const lengths = q.options.map((o) => o.t.length);
    const max = Math.max(...lengths);
    if (lengths[q.a] === max && lengths.filter((l) => l === max).length === 1) longest++;
  }
  const byDiff = [1, 2, 3].map((d) => questions.filter((q) => q.diff === d).length);
  return { total: questions.length, perDomain, positions, longestShare: questions.length ? longest / questions.length : 0, byDiff };
}

export function loadBank() {
  const dir = here("./bank/");
  const files = readdirSync(dir).filter((f) => f.endsWith(".txt")).sort();
  const all = [];
  const errors = [];
  for (const f of files) {
    const { questions, errors: e } = parseBank(readFileSync(dir + f, "utf8"), `bank/${f}`);
    all.push(...questions);
    errors.push(...e);
  }
  errors.push(...validate(all));
  return { questions: all, errors };
}

// The Arcade's ordering and matching drills, in bank/drills.json. Each
// sequence lists its steps in the correct order; each match set lists
// [term, definition] pairs. The page shuffles both.
export function loadDrills() {
  const drills = JSON.parse(readFileSync(here("./bank/drills.json"), "utf8"));
  return { drills, errors: validateDrills(drills) };
}

export function validateDrills(drills) {
  const errors = [];
  const ids = new Set();
  const objectiveOk = (obj) => {
    const d = DOMAINS[Number(String(obj).split(".")[0]) - 1];
    return !!(d && d.objectives[obj]);
  };
  const common = (x, kind) => {
    const tag = `drills ${kind} ${x.id || "(no id)"}`;
    if (!x.id || ids.has(x.id)) errors.push(`${tag} missing or duplicate id`);
    ids.add(x.id);
    if (!x.title) errors.push(`${tag} has no title`);
    if (!objectiveOk(x.obj)) errors.push(`${tag} objective ${x.obj} is not in the outline`);
    return tag;
  };
  for (const s of drills.sequences || []) {
    const tag = common(s, "sequence");
    if (!s.prompt || !s.note) errors.push(`${tag} needs a prompt and a note`);
    if (!Array.isArray(s.steps) || s.steps.length < 3 || s.steps.length > 8) errors.push(`${tag} needs 3 to 8 steps`);
    else if (new Set(s.steps.map((x) => x.toLowerCase())).size !== s.steps.length) errors.push(`${tag} repeats a step`);
  }
  for (const m of drills.matches || []) {
    const tag = common(m, "match");
    if (!Array.isArray(m.pairs) || m.pairs.length < 4 || m.pairs.length > 6) { errors.push(`${tag} needs 4 to 6 pairs`); continue; }
    if (m.pairs.some((p) => !Array.isArray(p) || p.length !== 2 || !p[0] || !p[1])) errors.push(`${tag} has a malformed pair`);
    for (const side of [0, 1]) {
      if (new Set(m.pairs.map((p) => String(p[side]).toLowerCase())).size !== m.pairs.length) errors.push(`${tag} repeats a ${side ? "definition" : "term"}`);
    }
  }
  if (!(drills.sequences || []).length || !(drills.matches || []).length) errors.push("drills.json needs sequences and matches");
  return errors;
}

// The Oracle's deck: one JSON file per Major Arcana card in bank/arcana.
export function loadArcana() {
  const dir = here("./bank/arcana/");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  const cards = [];
  const errors = [];
  for (const f of files) {
    try { cards.push({ ...JSON.parse(readFileSync(dir + f, "utf8")), file: `bank/arcana/${f}` }); }
    catch (e) { errors.push(`bank/arcana/${f}: not valid JSON (${e.message})`); }
  }
  cards.sort((a, b) => a.n - b.n);
  return { cards, errors: errors.concat(validateArcana(cards)) };
}

const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const GLYPH_TAGS = new Set(["path", "circle", "ellipse", "rect", "line", "polyline", "polygon", "g"]);
const GLYPH_ATTRS = new Set(["d", "cx", "cy", "r", "rx", "ry", "x", "y", "width", "height", "x1", "y1", "x2", "y2", "points", "transform", "stroke-width", "fill", "opacity", "stroke-opacity", "fill-opacity", "stroke-linecap", "stroke-linejoin", "stroke-dasharray"]);

// The card glyph is inlined into the page as SVG, so only plain shapes with
// plain geometry attributes are allowed: no text, links, styles, scripts or events.
export function checkGlyph(glyph) {
  const errors = [];
  const src = String(glyph || "").trim();
  if (!src) return ["glyph is empty"];
  if (src.length > 3000) errors.push(`glyph is ${src.length} characters; keep it under 3000`);
  const stripped = src.replace(/<(\/?)([a-zA-Z]+)((?:\s+[a-zA-Z-]+="[^"<>]*")*)\s*(\/?)>/g, (m, close, tag, attrs) => {
    if (!GLYPH_TAGS.has(tag)) errors.push(`glyph uses <${tag}>`);
    for (const [, name, value] of attrs.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) {
      if (!GLYPH_ATTRS.has(name)) errors.push(`glyph attribute ${name} is not allowed`);
      if (name === "fill" && !["none", "currentColor"].includes(value)) errors.push(`glyph fill must be none or currentColor, not ${value}`);
      if (/[a-z]\s*\(/i.test(value) && !(name === "transform" && /^(\s*(translate|rotate|scale)\([-\d.,\s]+\)\s*)+$/.test(value))) errors.push(`glyph attribute ${name} has a function value`);
    }
    return "";
  });
  if (stripped.trim()) errors.push(`glyph has text or markup outside plain tags: ${stripped.trim().slice(0, 60)}`);
  const shapes = (src.match(/<(path|circle|ellipse|rect|line|polyline|polygon)\b/g) || []).length;
  if (shapes < 2 || shapes > 30) errors.push(`glyph has ${shapes} shapes; use 2 to 30`);
  return errors;
}

export function validateArcana(cards) {
  const errors = [];
  if (cards.length !== 22) errors.push(`the deck has ${cards.length} cards, expected 22`);
  const ids = new Set();
  cards.forEach((c, i) => {
    const tag = `${c.file || "card"} (${c.name || c.id})`;
    const need = (cond, msg) => { if (!cond) errors.push(`${tag} ${msg}`); };
    need(c.n === i, `has n=${c.n}, expected ${i}`);
    need(c.id && !ids.has(c.id), "missing or duplicate id");
    ids.add(c.id);
    for (const k of ["name", "numeral", "archetype", "concept"]) need(c[k] && !/[<>&"]/.test(c[k]), `${k} is missing or has markup characters`);
    need(Array.isArray(c.objectives) && c.objectives.length >= 1 && c.objectives.every((o) => { const d = DOMAINS[Number(String(o).split(".")[0]) - 1]; return d && d.objectives[o]; }), "objectives must be outline objectives");
    need(Number.isInteger(c.hue) && c.hue >= 0 && c.hue < 360, "hue must be an integer 0-359");
    need(c.upright && c.upright.length <= 130, "upright must be 1-130 characters");
    need(c.reversed && c.reversed.length <= 130, "reversed must be 1-130 characters");
    const vw = words(c.vision);
    need(vw >= 50 && vw <= 120, `vision has ${vw} words; use 50-120`);
    need(Array.isArray(c.decode) && c.decode.length >= 3 && c.decode.length <= 5, "decode needs 3-5 lines");
    for (const d of c.decode || []) need(typeof d === "string" && d.includes("→") && d.length <= 170, `decode line must contain "→" and be at most 170 characters: ${String(d).slice(0, 50)}`);
    need(Array.isArray(c.facts) && c.facts.length === 3, "facts needs exactly 3 lines");
    for (const f of c.facts || []) need(typeof f === "string" && f.length >= 20 && f.length <= 180, `fact must be 20-180 characters: ${String(f).slice(0, 50)}`);
    need(c.trap && c.trap.length <= 220, "trap must be 1-220 characters");
    for (const e of checkGlyph(c.glyph)) errors.push(`${tag} ${e}`);
  });
  return errors;
}
