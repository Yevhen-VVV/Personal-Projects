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

let preferred: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (preferred) return preferred;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  preferred =
    voices.find((v) => v.lang === 'en-GB' && v.localService) ??
    voices.find((v) => v.lang === 'en-GB') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    voices[0];
  return preferred;
}

export function speak(text: string): void {
  if (!speechAvailable() || !text.trim()) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }
  // Slower than default. Learners consistently ask for this, and the default
  // rate is tuned for native speakers skimming, not for someone decoding.
  utterance.rate = 0.85;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (speechAvailable()) window.speechSynthesis.cancel();
}
