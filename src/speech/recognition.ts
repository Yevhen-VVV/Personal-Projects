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
  /**
   * Stop listening and discard whatever was heard, emitting nothing.
   *
   * Needed because stop() now settles asynchronously: leaving a turn, or
   * moving to the next phrase, must not have a transcript land a second later
   * on the screen that replaced it.
   */
  cancel(): void;
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
  /** Raw engine events, for the microphone self-check screen. */
  onEvent?: (name: string, detail?: string) => void;
}

/**
 * How long to wait after stop() for the engine to settle, before giving up
 * and using what we already have. Safari usually finalises within a few
 * hundred milliseconds; this is generous so nothing is lost, and it only ever
 * delays the moment the answer appears.
 */
const SETTLE_MS = 1500;

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
      cancel: () => {},
      get active() {
        return false;
      },
    };
  }

  let recogniser: SpeechRecognitionLike | null = null;
  let wanted = false;
  let settled: string[] = [];
  /**
   * The most recent not-yet-final text. Kept, and used as the answer when the
   * engine never marks anything final -- which is the ordinary case on Safari.
   * Discarding it was why every turn came back empty on an iPhone.
   */
  let interim = '';
  let sawAnySpeech = false;
  /** True between stop() and the moment the transcript is handed over. */
  let settling = false;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  /**
   * Bumped every time a session begins or is abandoned. An aborted engine
   * still delivers a last event or two, and without this it would see the
   * next session as its own -- restarting itself and spilling the previous
   * turn's words into the new one.
   */
  let generation = 0;

  const note = (name: string, detail?: string) => handlers.onEvent?.(name, detail);

  const transcript = () =>
    [...settled, interim].join(' ').replace(/\s+/g, ' ').trim();

  /**
   * Hands over the transcript exactly once. Called from onend after stop(),
   * or from the timer if the engine never says anything more.
   */
  const finish = () => {
    if (!settling) return;
    settling = false;
    clearTimeout(settleTimer);
    // On the timeout path the engine may still be alive. Abort it, or its
    // later onend sees a fresh session as "wanted" and restarts a second
    // engine feeding the same transcript.
    try {
      recogniser?.abort();
    } catch {
      /* already gone */
    }
    recogniser = null;

    const text = transcript();
    note('final', text || '(nothing)');
    if (!text && !sawAnySpeech) handlers.onError?.('no-speech');
    handlers.onFinal(text);
  };

  const build = (): SpeechRecognitionLike => {
    const r = new Ctor();
    const mine = generation;
    const stale = () => mine !== generation;
    // She is speaking English, whatever the interface language is.
    r.lang = 'en-GB';
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (event: never) => {
      if (stale()) return;
      const e = event as unknown as {
        resultIndex: number;
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
      };
      let pending = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const text = result[0]?.transcript ?? '';
        if (!text.trim()) continue;
        sawAnySpeech = true;
        if (result.isFinal) settled.push(text.trim());
        else pending += text;
      }
      interim = pending.trim();
      note('result', transcript());
      if (transcript()) handlers.onPartial?.(transcript());
    };

    r.onerror = (event: { error: string }) => {
      if (stale()) return;
      note('error', event.error);
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
      if (stale()) return;
      note('end');
      // Stopping is asynchronous: the engine may deliver its last result
      // between stop() and here. This is the earliest moment it is safe to
      // read the transcript, which is why finishing waits for it.
      if (settling) {
        finish();
        return;
      }
      // The engine decided she had finished. She had not necessarily -- only
      // a tap on Stop means that -- so start it again and keep listening.
      if (!wanted) return;

      // Bank whatever is still interim before restarting. A new session
      // resets the engine's own result list, so text left here would simply
      // vanish -- and on an engine that never marks anything final, that is
      // everything she said before the pause.
      if (interim) {
        settled.push(interim);
        interim = '';
      }

      try {
        r.start();
        note('restart');
      } catch {
        // Occasionally the engine refuses an immediate restart; a fresh
        // instance on the next tick always works.
        recogniser = null;
        setTimeout(() => {
          if (!wanted) return;
          recogniser = build();
          try {
            recogniser.start();
            note('restart');
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
      generation++;
      wanted = true;
      settled = [];
      interim = '';
      sawAnySpeech = false;
      settling = false;
      clearTimeout(settleTimer);
      recogniser = build();
      try {
        recogniser.start();
        note('start');
      } catch {
        wanted = false;
        handlers.onError?.('failed');
      }
    },

    stop() {
      if (!wanted) return;
      wanted = false;
      settling = true;
      note('stop');
      try {
        recogniser?.stop();
      } catch {
        // Already closed; nothing more is coming. Still deferred, because
        // every caller assumes onFinal arrives after the tap that caused it
        // -- finishing inline lands before their own state updates and
        // strands the button mid-tap.
        settleTimer = setTimeout(finish, 0);
        return;
      }
      // Wait for onend, which is when the last result has arrived. If the
      // engine never gets there, finish with what we have rather than
      // reporting silence she did not commit.
      settleTimer = setTimeout(finish, SETTLE_MS);
    },

    cancel() {
      generation++;
      wanted = false;
      settling = false;
      clearTimeout(settleTimer);
      note('cancel');
      try {
        recogniser?.abort();
      } catch {
        /* already gone */
      }
      recogniser = null;
      settled = [];
      interim = '';
    },

    get active() {
      return wanted;
    },
  };
}
