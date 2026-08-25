/**
 * The listener, against the way real engines actually deliver results.
 * Run with: npm run test:recognition
 *
 * Written after a report from an iPhone: the microphone listened, but every
 * turn came back empty. Two behaviours reproduce that, and neither is exotic
 * -- they are simply what Safari does.
 */
import { createListener } from '../src/speech/recognition';

type Mode =
  | 'final-before-stop'
  | 'final-after-stop'
  | 'interim-only'
  /**
   * The engine gives up mid-turn during a pause and is restarted. This is the
   * ordinary case on Safari during a long silence -- which is exactly the
   * situation the restart loop exists for -- so anything spoken before the
   * restart must survive it.
   */
  | 'interim-only-with-restart';

/** A stand-in for the browser's engine, in three flavours it really has. */
function installFake(mode: Mode, phrase: string) {
  const g = globalThis as unknown as Record<string, unknown>;
  // The module reads the constructor off `window`, as a browser would.
  g.window = g;
  const w = g;
  // Read at speak time, not capture time: a listener holds the constructor it
  // was built with, so changing what it says has to go through here.
  w.__phrase = phrase;
  w.__mode = mode;
  class Fake {
    lang = '';
    continuous = false;
    interimResults = false;
    maxAlternatives = 1;
    onresult: ((e: unknown) => void) | null = null;
    onend: (() => void) | null = null;
    onerror: ((e: { error: string }) => void) | null = null;

    private get phrase(): string {
      return (globalThis as unknown as Record<string, string>).__phrase ?? phrase;
    }

    private get mode(): Mode {
      return (globalThis as unknown as Record<string, Mode>).__mode ?? mode;
    }

    private send(text: string, isFinal: boolean) {
      const results = Object.assign([Object.assign([{ transcript: text }], { isFinal })], {
        length: 1,
      });
      this.onresult?.({ resultIndex: 0, results });
    }

    private restarted = false;

    start() {
      const mode = this.mode;
      const phrase = this.phrase;
      if (mode === 'interim-only-with-restart') {
        // First half, then the engine quits on its own; second half after the
        // restart. Neither part is ever marked final.
        const [first, second] = splitInTwo(phrase);
        if (!this.restarted) {
          setTimeout(() => this.send(first, false), 5);
          setTimeout(() => { this.restarted = true; this.onend?.(); }, 10);
        } else {
          setTimeout(() => this.send(second, false), 5);
        }
        return;
      }
      // Interim text arrives while she is still speaking, in every mode.
      setTimeout(() => this.send(phrase, false), 5);
      if (mode === 'final-before-stop') setTimeout(() => this.send(phrase, true), 10);
    }

    stop() {
      // Safari settles the result only once the session is closing, and the
      // engine may never mark it final at all.
      if (this.mode === 'final-after-stop') setTimeout(() => this.send(this.phrase, true), 5);
      setTimeout(() => this.onend?.(), 12);
    }

    abort() {
      // A real engine does not shut down instantly: its last onend can land
      // after the next session has already begun. That is what makes a stale
      // engine dangerous -- it sees the new session as its own.
      setTimeout(() => this.onend?.(), 80);
    }
  }
  w.SpeechRecognition = Fake;
  w.webkitSpeechRecognition = Fake;
}

const PHRASE = 'I would like to make an appointment';

function splitInTwo(text: string): [string, string] {
  const words = text.split(' ');
  const at = Math.floor(words.length / 2);
  return [words.slice(0, at).join(' '), words.slice(at).join(' ')];
}

async function run(mode: Mode): Promise<{ text: string; error: string | null }> {
  installFake(mode, PHRASE);
  return new Promise((resolve) => {
    let error: string | null = null;
    const listener = createListener({
      onFinal: (text) => resolve({ text, error }),
      onError: (reason) => { error = reason; },
    });
    listener.start();
    // She taps "I have finished" a moment after speaking.
    setTimeout(() => listener.stop(), 60);
    setTimeout(() => resolve({ text: '<<never finished>>', error }), 3000);
  });
}

let failures = 0;
const modes: Mode[] = [
  'final-before-stop',
  'final-after-stop',
  'interim-only',
  'interim-only-with-restart',
];

for (const mode of modes) {
  const { text, error } = await run(mode);
  const ok = text.trim() === PHRASE;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${mode}`);
  if (!ok) {
    console.log(`        expected ${JSON.stringify(PHRASE)}`);
    console.log(`        got      ${JSON.stringify(text)}${error ? ` (error: ${error})` : ''}`);
    failures++;
  }
}

// Genuine silence must still be reported as silence.
installFake('interim-only', '');
const silent = await new Promise<{ text: string; error: string | null }>((resolve) => {
  let error: string | null = null;
  const listener = createListener({
    onFinal: (text) => resolve({ text, error }),
    onError: (reason) => { error = reason; },
  });
  listener.start();
  setTimeout(() => listener.stop(), 25);
  setTimeout(() => resolve({ text: '<<never finished>>', error }), 3000);
});
const silentOk = silent.text === '' && silent.error === 'no-speech';
console.log(`${silentOk ? 'PASS' : 'FAIL'}  real silence is still reported as silence`);
if (!silentOk) {
  console.log(`        got ${JSON.stringify(silent.text)} (error: ${silent.error})`);
  failures++;
}

// Leaving a screen must not deliver a transcript to the screen that replaced
// it. stop() settles asynchronously, so quitting has to discard, not settle.
installFake('final-after-stop', PHRASE);
const cancelled = await new Promise<string>((resolve) => {
  const listener = createListener({ onFinal: (t) => resolve(`<<emitted: ${t}>>`) });
  listener.start();
  setTimeout(() => listener.cancel(), 25);
  setTimeout(() => resolve('nothing emitted'), 400);
});
const cancelOk = cancelled === 'nothing emitted';
console.log(`${cancelOk ? 'PASS' : 'FAIL'}  cancel() discards instead of delivering late`);
if (!cancelOk) {
  console.log(`        got ${cancelled}`);
  failures++;
}

// A cancelled turn must not leak its words into the next one.
installFake('interim-only', PHRASE);
const afterCancel = await new Promise<string>((resolve) => {
  const listener = createListener({ onFinal: resolve });
  listener.start();
  setTimeout(() => listener.cancel(), 20);
  setTimeout(() => {
    installFake('interim-only', 'yes please');
    listener.start();
    setTimeout(() => listener.stop(), 25);
  }, 40);
  setTimeout(() => resolve('<<never finished>>'), 1500);
});
const leakOk = afterCancel.trim() === 'yes please';
console.log(`${leakOk ? 'PASS' : 'FAIL'}  a cancelled turn does not leak into the next one`);
if (!leakOk) {
  console.log(`        expected "yes please", got ${JSON.stringify(afterCancel)}`);
  failures++;
}

// A slow abort must not let the discarded engine rejoin the next session.
installFake('interim-only', 'first turn words');
const slowAbort = await new Promise<string>((resolve) => {
  const listener = createListener({ onFinal: resolve });
  listener.start();
  setTimeout(() => listener.cancel(), 20);
  setTimeout(() => {
    installFake('interim-only', 'second turn words');
    listener.start();
  }, 40);
  // The abandoned engine's onend lands here, after the new session began.
  setTimeout(() => listener.stop(), 200);
  setTimeout(() => resolve('<<never finished>>'), 2000);
});
const slowOk = slowAbort.trim() === 'second turn words';
console.log(`${slowOk ? 'PASS' : 'FAIL'}  a slowly-aborted engine cannot rejoin the next session`);
if (!slowOk) {
  console.log(`        expected "second turn words", got ${JSON.stringify(slowAbort)}`);
  failures++;
}

console.log(failures ? `\n${failures} failing` : '\nAll checks passed.');
process.exitCode = failures ? 1 : 0;
