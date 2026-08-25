import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Scenario, Turn } from '../engine/corpus/scenarios';
import { match, type MatchResult } from '../engine/match';
import { createListener, recognitionAvailable, type Listener, type RecognitionError } from '../speech/recognition';
import { speak, speechAvailable, stopSpeaking } from './speech';
import { UI } from './strings';

export interface TurnResult {
  turn: Turn;
  said: string;
  result: MatchResult;
  usedHelp: boolean;
}

/**
 * A spoken conversation.
 *
 * Three rules shape everything here, and each one is a deliberate reversal of
 * how a quiz app normally behaves:
 *
 *  - She is never cut off. Recognition starts and stops on her tap alone.
 *  - She is never corrected mid-conversation. A wrong turn still moves
 *    forward, because stopping to correct someone mid-sentence is how you
 *    teach them to stop talking.
 *  - There is always a way out. "I don't know what to say" shows the phrase
 *    and lets her borrow it, with no penalty and no scolding.
 *
 * Everything she said is collected and reviewed once, at the end.
 */
export function RolePlay({
  scenario,
  onDone,
  onQuit,
}: {
  scenario: Scenario;
  onDone: (results: TurnResult[]) => void;
  onQuit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<TurnResult[]>([]);
  const [started, setStarted] = useState(false);
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState('');
  const [showRu, setShowRu] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [usedHelp, setUsedHelp] = useState(false);
  const [problem, setProblem] = useState<RecognitionError | null>(null);

  const turn = scenario.turns[index];
  const listenerRef = useRef<Listener | null>(null);

  const advance = useCallback(
    (said: string, help: boolean) => {
      const entry: TurnResult = {
        turn: scenario.turns[index],
        said,
        result: match(said, scenario.turns[index].expect),
        usedHelp: help,
      };
      const next = [...results, entry];
      setResults(next);
      setPartial('');
      setShowRu(false);
      setHelpOpen(false);
      setUsedHelp(false);

      if (index + 1 >= scenario.turns.length) onDone(next);
      else setIndex(index + 1);
    },
    [index, results, scenario.turns, onDone],
  );

  // A fresh listener per turn, so a transcript never leaks across turns.
  useEffect(() => {
    listenerRef.current = createListener({
      onPartial: setPartial,
      onFinal: (text) => {
        setListening(false);
        // Advance whatever she said, including nothing. Judging happens later.
        advance(text, usedHelp);
      },
      onError: (reason) => {
        setListening(false);
        if (reason !== 'no-speech') setProblem(reason);
      },
    });
    return () => listenerRef.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, advance]);

  // The partner speaks each new line aloud, as a person would.
  useEffect(() => {
    if (started && turn) speak(turn.partner);
    return stopSpeaking;
  }, [started, turn]);

  const toggleMic = () => {
    const listener = listenerRef.current;
    if (!listener) return;
    if (listener.active) {
      listener.stop();
      return;
    }
    // Never listen while the partner is still speaking, or it hears itself.
    stopSpeaking();
    setProblem(null);
    setPartial('');
    listener.start();
    setListening(true);
  };

  const unavailable = !recognitionAvailable();

  if (!started) {
    return (
      <div>
        <div className="topbar">
          <button onClick={onQuit}>{UI.back}</button>
        </div>
        <h1>{scenario.title}</h1>
        <div className="card">
          <p>{scenario.setting}</p>
          <p className="muted small">{UI.talk.youTalkTo(scenario.partnerRole)}</p>
        </div>
        {unavailable && <div className="verdict wrong"><p>{UI.talk.noMic}</p></div>}
        <button className="btn-primary" onClick={() => setStarted(true)} disabled={unavailable}>
          {UI.talk.begin}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="topbar">
        <button onClick={() => { stopSpeaking(); listenerRef.current?.stop(); onQuit(); }}>
          {UI.talk.quit}
        </button>
        <span className="muted small">{UI.talk.turnOf(index + 1, scenario.turns.length)}</span>
      </div>

      <div className="speech-bubble">
        <div className="who">{scenario.partnerRole}</div>
        <div className="line" lang="en">{turn.partner}</div>
      </div>

      <div className="btn-row" style={{ marginBottom: '1rem' }}>
        {speechAvailable() && (
          <button className="speak" onClick={() => speak(turn.partner)}>{UI.talk.replay}</button>
        )}
        <button className="speak" onClick={() => setShowRu(!showRu)}>
          {showRu ? UI.talk.hideRu : UI.talk.showRu}
        </button>
      </div>

      {showRu && <p className="muted">{turn.partnerRu}</p>}

      <div className={`heard ${partial ? 'has-text' : ''}`} aria-live="polite">
        {partial ? <span lang="en">{partial}</span> : listening ? UI.talk.listening : UI.talk.youSaid}
      </div>

      {problem && (
        <div className="verdict wrong">
          <p>{problem === 'no-permission' ? UI.talk.noPermission : UI.talk.noMic}</p>
        </div>
      )}

      {helpOpen ? (
        <div className="card">
          <h3>{UI.talk.helpTitle}</h3>
          <p className="phrase-en" lang="en">{turn.model}</p>
          <p className="phrase-ru">{turn.modelRu}</p>
          <div className="btn-row">
            {speechAvailable() && (
              <button onClick={() => speak(turn.model)}>{UI.talk.helpRepeat}</button>
            )}
            <button onClick={() => { setHelpOpen(false); setUsedHelp(true); }}>
              {UI.talk.helpContinue}
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            className={`mic ${listening ? 'on' : ''}`}
            onClick={toggleMic}
            aria-pressed={listening}
          >
            {listening ? UI.talk.tapToStop : UI.talk.tapToSpeak}
          </button>
          <button
            className="btn-secondary"
            style={{ marginTop: '0.75rem' }}
            onClick={() => { stopSpeaking(); setHelpOpen(true); setUsedHelp(true); }}
          >
            {UI.talk.help}
          </button>
        </>
      )}
    </div>
  );
}

/** The single moment in a conversation where anything is corrected. */
export function RolePlayReview({
  scenario,
  results,
  onAgain,
  onAnother,
}: {
  scenario: Scenario;
  results: TurnResult[];
  onAgain: () => void;
  onAnother: () => void;
}) {
  const good = useMemo(() => results.filter((r) => r.result.ok).length, [results]);

  return (
    <div>
      <h1>{UI.talk.reviewTitle}</h1>
      <div className="card">
        <p>{UI.talk.reviewLead}</p>
        <p><strong>{UI.talk.reviewGood(good, results.length)}</strong></p>
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${results.length ? (good / results.length) * 100 : 0}%` }} />
        </div>
      </div>

      <div className="card">
        {results.map((r, i) => (
          <div key={i} className="review-row">
            <div className="label">{UI.talk.reviewYouSaid}</div>
            <div className="said" lang={r.said ? 'en' : undefined}>
              {r.said || UI.talk.reviewSilent}
              {r.usedHelp && <span className="pill" style={{ marginLeft: '0.5rem' }}>{UI.talk.reviewUsedHelp}</span>}
            </div>
            <div className="label" style={{ marginTop: '0.4rem' }}>{UI.talk.reviewBetter}</div>
            <div className="better" lang="en">{r.turn.model}</div>
            <div className="muted small">{r.turn.modelRu}</div>
            {r.turn.note && <div className="muted small" style={{ marginTop: '0.35rem' }}>{r.turn.note}</div>}
          </div>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn-primary" onClick={onAgain}>{UI.talk.againSame}</button>
        <button className="btn-secondary" onClick={onAnother}>{UI.talk.pickAnother}</button>
      </div>
      <p className="muted small center" style={{ marginTop: '0.75rem' }}>{scenario.setting}</p>
    </div>
  );
}
