import { useEffect, useRef, useState } from 'react';
import type { Phrase } from '../engine/corpus/survival';
import { similarity } from '../engine/match';
import { createListener, isEmbedded, recognitionAvailable, type Listener } from '../speech/recognition';
import { speak, speechAvailable, stopSpeaking } from './speech';
import { UI } from './strings';
import { MicNotice } from './MicNotice';

/** Above this, the repeat counts as said well. Generous, because recognition mishears. */
const GOOD_ENOUGH = 0.6;
const EXCELLENT = 0.85;

/**
 * Shadowing: hear the phrase, then say it aloud straight away.
 *
 * The point is not comprehension -- she already has the Russian in front of
 * her -- it is getting her mouth around the English while it is still fresh in
 * her ear. That is the shortest path from recognising a phrase to producing
 * one, which is the difference between reading English and speaking it.
 *
 * Scoring is deliberately forgiving. Recognition mishears accented English
 * constantly, and a drill that tells a learner she got it wrong when she did
 * not is worse than no drill at all.
 */
export function Shadowing({
  phrases,
  onDone,
  onQuit,
}: {
  phrases: Phrase[];
  onDone: () => void;
  onQuit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [heardOnce, setHeardOnce] = useState(false);
  const [settling, setSettling] = useState(false);

  const phrase = phrases[index];
  const listenerRef = useRef<Listener | null>(null);

  useEffect(() => {
    listenerRef.current = createListener({
      onPartial: setHeard,
      onFinal: (text) => {
        setListening(false);
        setSettling(false);
        setHeard(text);
        setScore(similarity(text, phrases[index].en));
      },
      onError: () => {
        setListening(false);
        setSettling(false);
        setScore(0);
      },
    });
    return () => listenerRef.current?.cancel();
  }, [index, phrases]);

  // Moving to a new phrase resets the per-phrase state. Derived during render
  // rather than in an effect, so there is no second render pass.
  const [shownIndex, setShownIndex] = useState(index);
  if (shownIndex !== index) {
    setShownIndex(index);
    setHeard('');
    setScore(null);
    setHeardOnce(false);
    setSettling(false);
  }

  // Say it to her first: shadowing needs a model to shadow. This one is a real
  // effect -- speech synthesis is an external system.
  useEffect(() => {
    if (phrase) speak(phrase.en, { onEnd: () => setHeardOnce(true) });
    return stopSpeaking;
  }, [phrase]);

  const toggleMic = () => {
    const listener = listenerRef.current;
    if (!listener) return;
    if (listener.active) {
      // The transcript settles a moment after the tap; say so.
      listener.stop();
      setListening(false);
      setSettling(true);
      return;
    }
    stopSpeaking();
    setHeard('');
    setScore(null);
    listener.start();
    setListening(true);
  };

  const next = () => {
    stopSpeaking();
    // cancel, not stop: a transcript settling a second from now belongs to the
    // phrase we are leaving, and would paint itself over the next one.
    listenerRef.current?.cancel();
    if (index + 1 >= phrases.length) onDone();
    else setIndex(index + 1);
  };

  if (!phrase) return null;

  const verdict =
    score === null ? null : score >= EXCELLENT ? 'excellent' : score >= GOOD_ENOUGH ? 'good' : 'again';

  return (
    <div>
      <div className="topbar">
        <button onClick={() => { stopSpeaking(); listenerRef.current?.cancel(); onQuit(); }}>
          {UI.talk.quit}
        </button>
        <span className="muted small">{UI.talk.turnOf(index + 1, phrases.length)}</span>
      </div>

      <div className="card">
        <p className="phrase-en" lang="en">{phrase.en}</p>
        <p className="phrase-ru">{phrase.ru}</p>
        <p className="muted small">{UI.phrases.whenToUse}: {phrase.when}</p>
        {speechAvailable() && (
          <button className="speak" onClick={() => speak(phrase.en, { onEnd: () => setHeardOnce(true) })}>
            {UI.phrases.listenFirst}
          </button>
        )}
      </div>

      {recognitionAvailable() && !isEmbedded() ? (
        <>
          <p className="muted center">{heardOnce ? UI.phrases.yourTurn : ''}</p>
          <div className={`heard ${heard ? 'has-text' : ''}`} aria-live="polite">
            {heard ? (
              <><span className="muted small">{UI.phrases.heard} </span><span lang="en">{heard}</span></>
            ) : settling ? (
              UI.talk.thinking
            ) : listening ? (
              UI.talk.listening
            ) : (
              ''
            )}
          </div>

          <button
            className={`mic ${listening ? 'on' : ''}`}
            onClick={toggleMic}
            aria-pressed={listening}
            disabled={settling}
          >
            {settling ? UI.talk.thinking : listening ? UI.phrases.stopRepeat : UI.phrases.repeat}
          </button>
        </>
      ) : (
        <MicNotice />
      )}

      {verdict && (
        <div className={`verdict ${verdict === 'again' ? 'wrong' : 'right'}`}>
          <h3>
            {verdict === 'excellent'
              ? UI.phrases.excellent
              : verdict === 'good'
                ? UI.phrases.good
                : UI.phrases.tryAgain}
          </h3>
        </div>
      )}

      <div className="btn-row" style={{ marginTop: '1rem' }}>
        {score !== null && (
          <button onClick={() => { setScore(null); setHeard(''); speak(phrase.en); }}>
            {UI.phrases.again}
          </button>
        )}
        <button className="btn-primary" onClick={next}>
          {index + 1 >= phrases.length ? UI.listen.ready : UI.phrases.next}
        </button>
      </div>
    </div>
  );
}
