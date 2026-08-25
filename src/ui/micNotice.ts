import type { RecognitionError } from '../speech/recognition';

export type MicNoticeKind = 'none' | 'embedded' | 'no-permission' | 'unavailable';

/**
 * Which microphone notice to show, if any.
 *
 * Pulled out as a pure function because the embedded case is the one that
 * matters and the hardest to reach in a browser test: inside a frame the
 * recognition API exists and start() fails with exactly the same
 * "not-allowed" a real denial gives. Telling her to change a browser setting
 * there sends her somewhere that cannot help, so the two must not be
 * conflated -- and that is worth testing directly rather than by nesting a
 * cross-origin iframe.
 */
export function micNoticeKind(input: {
  embedded: boolean;
  available: boolean;
  problem?: RecognitionError | null;
}): MicNoticeKind {
  const { embedded, available, problem } = input;

  // Being in a frame beats everything: no browser setting can fix it.
  if (problem === 'embedded' || embedded) return 'embedded';
  if (problem === 'no-permission') return 'no-permission';
  if (!available || problem === 'not-supported' || problem === 'failed') return 'unavailable';
  return 'none';
}
