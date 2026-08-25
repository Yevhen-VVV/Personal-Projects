/**
 * Which microphone message she is shown.
 * Run with: npm run test:mic
 *
 * The case that matters: inside a frame the recognition API exists and
 * start() fails with the same "not-allowed" a genuine denial gives. If those
 * are conflated the app tells her to change a browser setting that cannot
 * possibly fix it, and she has no way to discover that.
 */
import { micNoticeKind } from '../src/ui/micNotice';

let failures = 0;
const check = (name: string, actual: string, expected: string) => {
  const ok = actual === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) {
    console.log(`        expected ${expected}, got ${actual}`);
    failures++;
  }
};

check('working microphone shows nothing',
  micNoticeKind({ embedded: false, available: true }), 'none');

check('embedded shows the address, even before any error',
  micNoticeKind({ embedded: true, available: true }), 'embedded');

check('embedded wins over a denial, which is how it arrives in practice',
  micNoticeKind({ embedded: true, available: true, problem: 'no-permission' }), 'embedded');

check('an explicit embedded error is honoured even if the frame check missed it',
  micNoticeKind({ embedded: false, available: true, problem: 'embedded' }), 'embedded');

check('a genuine denial on a top-level page asks for permission',
  micNoticeKind({ embedded: false, available: true, problem: 'no-permission' }), 'no-permission');

check('no API at all is reported as unavailable',
  micNoticeKind({ embedded: false, available: false }), 'unavailable');

check('a hard failure is reported as unavailable',
  micNoticeKind({ embedded: false, available: true, problem: 'failed' }), 'unavailable');

check('a silent turn is not an error worth a notice',
  micNoticeKind({ embedded: false, available: true, problem: 'no-speech' }), 'none');

console.log(failures ? `\n${failures} failing` : '\nAll checks passed.');
process.exitCode = failures ? 1 : 0;
