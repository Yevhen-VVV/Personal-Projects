/**
 * Speech recognition, tuned for a learner who needs time to think.
 *
 * The browser's default behaviour is the opposite of what we want: it listens
 * for a moment, decides the speaker has finished, and cuts them off. For
 * someone assembling an English sentence in their head before saying it, that
 * is the single most discouraging thing an app can do -- it ends the turn
 * mid-thought and makes the learner feel slow.
 *
 * So this wrapper never decides on its own that she has finished. Recognition
 * is started and stopped only by an explicit tap. When the engine gives up
 * during a pause -- which it does, and cannot be configured not to -- we
 * restart it immediately and keep the transcript we already have. From the
 * learner's side there is no time limit and no interruption.
 */

export interface Listener {
  /** Begin listening. Must be called from a user gesture on iOS. */
  start(): void;
  /** Stop listening and settle on the final transcript. */
  stop(): void;
  /** True between start() and stop(). */
  readonly active: boolean;
}

export interface ListenerHandlers {
  /** Fires as she speaks, for live on-screen feedback. */
  onPartial?: (text: string) => void;
  /** Fires once, after stop(), with everything heard across restarts. */
  onFinal: (text: string) => void;
  /** Recognition could not run at all -- no permission, no support. */
  onError?: (reason: RecognitionError) => void;
}

export type RecognitionError =
  | 'not-supported'
  | 'no-permission'
  | 'no-speech'
  | 'failed'
  /**
   * The page is running inside someone else's frame, where the microphone is
   * blocked by permissions policy. Worth its own case because the API is
   * present and start() fails with the same "not-allowed" as a genuine denial
   * -- so without this the app tells her to change a browser setting that
   * cannot fix it, and she has no way to discover that.
   */
  | 'embedded';

/** True when the app is running inside an iframe rather than as its own page. */
export function isEmbedded(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    // A cross-origin parent throws on access, which itself means embedded.
    return true;
  }
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: never) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

function ctor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  // Safari, including on iOS, exposes only the prefixed name.
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function recognitionAvailable(): boolean {
  return ctor() !== null;
}

export function createListener(handlers: ListenerHandlers): Listener {
  const Ctor = ctor();
  if (!Ctor) {
    return {
      start: () => handlers.onError?.('not-supported'),
      stop: () => {},
      get active() {
        return false;
      },
    };
  }

  let recogniser: SpeechRecognitionLike | null = null;
  let wanted = false;
  let settled: string[] = [];
  let sawAnySpeech = false;

  const build = (): SpeechRecognitionLike => {
    const r = new Ctor();
    // She is speaking English, whatever the interface language is.
    r.lang = 'en-GB';
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (event: never) => {
      const e = event as unknown as {
        resultIndex: number;
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
      };
      let partial = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const text = result[0]?.transcript ?? '';
        if (!text.trim()) continue;
        sawAnySpeech = true;
        if (result.isFinal) settled.push(text.trim());
        else partial += text;
      }
      if (partial.trim() || settled.length) {
        handlers.onPartial?.([...settled, partial].join(' ').replace(/\s+/g, ' ').trim());
      }
    };

    r.onerror = (event: { error: string }) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        wanted = false;
        handlers.onError?.(isEmbedded() ? 'embedded' : 'no-permission');
        return;
      }
      // "no-speech" and "aborted" are ordinary during a long pause. Restarting
      // is handled by onend; treating them as failures would end her turn.
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        handlers.onError?.('failed');
      }
    };

    r.onend = () => {
      // The engine decided she had finished. She had not necessarily -- only
      // a tap on Stop means that -- so start it again and keep listening.
      if (!wanted) return;
      try {
        r.start();
      } catch {
        // Occasionally the engine refuses an immediate restart; a fresh
        // instance on the next tick always works.
        recogniser = null;
        setTimeout(() => {
          if (!wanted) return;
          recogniser = build();
          try {
            recogniser.start();
          } catch {
            handlers.onError?.('failed');
          }
        }, 120);
      }
    };

    return r;
  };

  return {
    start() {
      if (wanted) return;
      wanted = true;
      settled = [];
      sawAnySpeech = false;
      recogniser = build();
      try {
        recogniser.start();
      } catch {
        wanted = false;
        handlers.onError?.('failed');
      }
    },

    stop() {
      if (!wanted) return;
      wanted = false;
      try {
        recogniser?.stop();
      } catch {
        /* already stopped */
      }
      recogniser = null;
      const text = settled.join(' ').replace(/\s+/g, ' ').trim();
      if (!text && !sawAnySpeech) handlers.onError?.('no-speech');
      handlers.onFinal(text);
    },

    get active() {
      return wanted;
    },
  };
}
