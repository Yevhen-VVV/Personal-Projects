#!/usr/bin/env node
/**
 * Go-live gate. Exits non-zero while anything blocks a public launch.
 * Run: npm run check:launch
 *
 * It reads the source rather than importing it, so it needs no build.
 * Every BLOCKER must be fixed before setting `launched: true`.
 * WARNINGS are worth fixing but do not block.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const read = (p) => readFileSync(join(root, p), 'utf8');
const blockers = [];
const warnings = [];

function walk(dir) {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const p = join(dir, name);
    return statSync(join(root, p)).isDirectory() ? walk(p) : [p];
  });
}

// 1. Placeholders still listed in config.
const config = read('src/config.ts');
const ph = config.match(/export const PLACEHOLDERS: string\[\] = \[([\s\S]*?)\];/);
const listed = ph ? [...ph[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
if (listed.length) blockers.push(`config.ts PLACEHOLDERS still lists: ${listed.join(', ')}`);

// 2. Invented values that must never ship.
for (const [re, why] of [
  [/555-01\d\d/, 'a fictional 555-01xx phone number'],
  [/Placeholder bio/i, 'the placeholder driver bio'],
  [/Mailing address to come/i, 'the placeholder mailing address'],
  [/name: 'Your driver'/, 'the placeholder driver name'],
]) if (re.test(config)) blockers.push(`config.ts contains ${why}`);

// 3. Credentials required before taking paid passengers.
for (const key of ['adot', 'auto', 'tpt']) {
  const m = config.match(new RegExp(`key: '${key}',[^}]*status: '([a-z]+)'`));
  if (!m || m[1] !== 'held') blockers.push(`credential "${key}" is not marked held in config.ts`);
}
const rd = config.match(/readiness: \{([\s\S]*?)\}/);
if (rd) for (const m of rd[1].matchAll(/(\w+): (true|false)/g)) if (m[2] === 'false') blockers.push(`readiness.${m[1]} is not done (see config.ts)`);
if (/verified: false/.test(config)) warnings.push('vehicle facts not yet checked against the actual car: seat count (7 with captain\'s chairs, or 8), features list, luggage space (vehicle.verified)');

// 4. Legal drafts and review notes.
for (const f of walk('src/pages/legal')) {
  const s = read(f);
  if (/^draft:\s*true/m.test(s)) blockers.push(`${relative(root, join(root, f))} is still an unreviewed draft (draft: true)`);
  if (/Note for review/i.test(s)) blockers.push(`${f} still contains an internal "Note for review"`);
}

// 5. Booking path.
if (/provider: 'request'/.test(config) && /formEndpoint: ''/.test(config)) {
  warnings.push('bookings rely on the guest\'s email app (no formEndpoint and no booking platform); fine for a soft launch, not for scale');
}

// 6. Content markers anywhere in src.
for (const f of walk('src')) {
  const s = read(f);
  if (/\bTODO\b|PLACEHOLDER(?!S)/.test(s)) blockers.push(`${f} contains TODO or PLACEHOLDER`);
  if (/Exact distances are being measured/.test(s)) warnings.push(`${f}: walking distances not yet measured`);
  if (/goes here\./.test(s)) warnings.push(`${f}: an image placeholder ("goes here") remains`);
}

// 7. Launch flag consistency.
const launched = /launched: true/.test(config);

const line = (s) => console.log('  - ' + s);
console.log('\nThree Tickets to Adventure — launch check\n');
if (blockers.length) { console.log(`BLOCKERS (${blockers.length})`); blockers.forEach(line); }
if (warnings.length) { console.log(`\nWARNINGS (${warnings.length})`); [...new Set(warnings)].forEach(line); }
if (!blockers.length) console.log('No blockers. Set `launched: true` in src/config.ts, rebuild and deploy.');
if (launched && blockers.length) console.log('\n!! launched is true but blockers remain. Set it back to false.');
console.log('');
process.exit(blockers.length ? 1 : 0);
