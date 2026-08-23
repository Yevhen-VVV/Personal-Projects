/**
 * Text-to-speech via the browser's built-in speech synthesis.
 *
 * Hearing the sentence matters as much as reading it: many learners at this
 * stage read far better than they listen, and a written-only app quietly
 * reinforces that gap. Speech is a progressive enhancement -- where the API
 * is missing the button simply does not appear.
 */

export function speechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Voices known to be female, by platform. There is no field on the API that
 * says so -- `SpeechSynthesisVoice` exposes only a name, a language and
 * whether it is local -- so matching names is the only way to express a
 * preference. Unknown voices simply score neutral rather than being excluded.
 */
const FEMALE = [
  // Apple
  'samantha', 'serena', 'kate', 'martha', 'moira', 'fiona', 'tessa', 'karen', 'catherine', 'stephanie',
  // Google
  'google uk english female', 'google us english',
  // Microsoft
  'hazel', 'zira', 'susan', 'linda', 'sonia', 'libby', 'aria', 'jenny', 'michelle',
];

const MALE = [
  'daniel', 'oliver', 'alex', 'fred', 'gordon', 'arthur', 'rishi', 'aaron',
  'google uk english male', 'george', 'david', 'mark', 'ryan', 'guy', 'james', 'thomas',
];

/** Higher-quality variants, where a device offers both. */
const BETTER_QUALITY = /enhanced|premium|natural|neural|siri/i;

/**
 * Picks the best available voice: an English one, female where the device
 * offers a recognisable choice, and a higher-quality variant over a compact
 * one. Scored rather than matched in order, because the available set differs
 * wildly between an iPhone, a Windows laptop and a browser on either.
 */
export function chooseVoice(voices: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const score = (v: SpeechSynthesisVoice): number => {
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();
    let s = 0;

    if (lang.startsWith('en')) s += 100;
    // British English matches the spelling and vocabulary the app teaches.
    if (lang.startsWith('en-gb')) s += 50;

    if (/\bfemale\b/.test(name) || FEMALE.some((f) => name.includes(f))) s += 40;
    if (/\bmale\b/.test(name) || MALE.some((m) => name.includes(m))) s -= 60;

    if (BETTER_QUALITY.test(v.name)) s += 25;
    // A local voice cannot stall on a bad connection.
    if (v.localService) s += 5;

    return s;
  };

  return voices.reduce((best, v) => (score(v) > score(best) ? v : best), voices[0]);
}

let preferred: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (preferred) return preferred;
  preferred = chooseVoice(window.speechSynthesis.getVoices());
  return preferred;
}

// Voices load asynchronously on most browsers, so the first call can see an
// empty list. Without this the app would keep whatever it picked from nothing.
if (speechAvailable()) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    preferred = null;
  });
}

export function speak(text: string): void {
  if (!speechAvailable() || !text.trim()) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = 'en-GB';
  }
  // Slower than default. Learners consistently ask for this, and the default
  // rate is tuned for native speakers skimming, not for someone decoding.
  utterance.rate = 0.85;
  // Very slightly raised: it reads as warmer without sounding artificial.
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (speechAvailable()) window.speechSynthesis.cancel();
}
