/**
 * Checks voice selection against the voice lists real devices actually offer.
 * Run with: npm run test:voice
 *
 * The point is the iPhone case: the default en-GB voice there is Daniel, who
 * is male, so "just take the first en-GB voice" gets it wrong.
 */
import { chooseVoice } from '../src/ui/speech';

type V = { name: string; lang: string; localService: boolean };
const v = (name: string, lang: string, localService = true): V => ({ name, lang, localService });

const CASES: [string, V[], string][] = [
  [
    'iPhone: picks Serena over the male en-GB default',
    [v('Daniel', 'en-GB'), v('Serena', 'en-GB'), v('Samantha', 'en-US'), v('Yuri', 'ru-RU')],
    'Serena',
  ],
  [
    'iPhone with enhanced voices: prefers the higher-quality female voice',
    [v('Serena', 'en-GB'), v('Kate (Enhanced)', 'en-GB'), v('Daniel (Enhanced)', 'en-GB')],
    'Kate (Enhanced)',
  ],
  [
    'Chrome on Android: picks the explicitly female UK voice',
    [v('Google UK English Male', 'en-GB', false), v('Google UK English Female', 'en-GB', false)],
    'Google UK English Female',
  ],
  [
    'Windows: picks Hazel over George',
    [
      v('Microsoft George - English (United Kingdom)', 'en-GB'),
      v('Microsoft Hazel Desktop - English (Great Britain)', 'en-GB'),
      v('Microsoft Irina - Russian', 'ru-RU'),
    ],
    'Microsoft Hazel Desktop - English (Great Britain)',
  ],
  [
    'prefers British English over American when both are female',
    [v('Samantha', 'en-US'), v('Kate', 'en-GB')],
    'Kate',
  ],
  [
    'falls back to any English voice when none is recognisably female',
    [v('Rocko', 'en-GB'), v('Yuri', 'ru-RU')],
    'Rocko',
  ],
  [
    'never picks a Russian voice for English sentences',
    [v('Milena', 'ru-RU'), v('Rocko', 'en-US')],
    'Rocko',
  ],
];

let failures = 0;
for (const [name, voices, expected] of CASES) {
  const got = chooseVoice(voices as unknown as SpeechSynthesisVoice[])?.name;
  const ok = got === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) {
    console.log(`        expected ${JSON.stringify(expected)}, got ${JSON.stringify(got)}`);
    failures++;
  }
}

const empty = chooseVoice([]);
const emptyOk = empty === null;
console.log(`${emptyOk ? 'PASS' : 'FAIL'}  returns null when the device offers no voices`);
if (!emptyOk) failures++;

console.log(failures ? `\n${failures} failing` : '\nAll checks passed.');
process.exitCode = failures ? 1 : 0;
