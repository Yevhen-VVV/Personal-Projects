import { useEffect, useMemo, useState } from 'react';
import type { Comprehension, Passage } from '../engine/corpus/listening';
import { spokenSeconds } from '../engine/corpus/listening';
import { NATURAL_RATE, speak, speechAvailable, stopSpeaking } from './speech';
import { UI } from './strings';
import { BLANK } from '../engine/types';

type Pass = 1 | 2 | 3 | 4;

/**
 * The four-pass listening ladder.
 *
 * The same thirty seconds of audio, four times, each pass asking for
 * something different: the gist, then the details, then following the written
 * text, then once more with nothing to read. Always at ordinary speaking
 * speed -- slowing it down would make the exercise easy and useless.
 *
 * The fourth pass carries the whole point. Audio that was an unbroken blur on
 * the first pass is comfortable by the fourth, and noticing that is what
 * convinces a learner that her ear can be trained.
 */
export function Listening({
  passage,
  onDone,
  onQuit,
}: {
  passage: Passage;
  onDone: () => void;
  onQuit: () => void;
}) {
  const [pass, setPass] = useState<Pass>(1);
  const [playing, setPlaying] = useState(false);
  const [heardOnce, setHeardOnce] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const questions: Comprehension[] = useMemo(() => {
    if (pass === 1) return [passage.gist];
    if (pass === 2) return passage.details;
    if (pass === 3) {
      return passage.gaps.map((g) => ({
        q: g.sentence,
        options: g.options,
        answer: g.options.indexOf(g.answer),
      }));
    }
    return [];
  }, [pass, passage]);

  useEffect(() => stopSpeaking, []);

  const play = () => {
    setPlaying(true);
    // Natural rate: the exercise is getting used to ordinary speed.
    speak(passage.text, { rate: NATURAL_RATE, onEnd: () => { setPlaying(false); setHeardOnce(true); } });
  };

  const nextPass = () => {
    stopSpeaking();
    setHeardOnce(false);
    setQIndex(0);
    setPicked(null);
    if (pass >= 4) onDone();
    else setPass((pass + 1) as Pass);
  };

  const answer = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
  };

  const nextQuestion = () => {
    setPicked(null);
    if (qIndex + 1 >= questions.length) nextPass();
    else setQIndex(qIndex + 1);
  };

  const question = questions[qIndex];
  const showTranscript = pass === 3;

  return (
    <div>
      <div className="topbar">
        <button onClick={() => { stopSpeaking(); onQuit(); }}>{UI.talk.quit}</button>
        <span className="muted small">{UI.listen.passOf(pass)}</span>
      </div>

      <div className="pass-rail" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <i key={n} className={n < pass ? 'done' : n === pass ? 'now' : ''} />
        ))}
      </div>

      <h1>{UI.listen.passNames[pass]}</h1>
      <p className="muted">{UI.listen.passHints[pass]}</p>

      <div className="card">
        <p className="muted small">{passage.setting} · ~{spokenSeconds(passage.text)} сек.</p>
        {speechAvailable() ? (
          <button className="btn-primary" onClick={play} disabled={playing}>
            {playing ? UI.listen.playing : heardOnce ? UI.listen.replay : UI.listen.play}
          </button>
        ) : (
          <p>{UI.talk.noMic}</p>
        )}

        {showTranscript && heardOnce && (
          <div style={{ marginTop: '1rem' }}>
            <h3>{UI.listen.transcript}</h3>
            <p lang="en">{passage.text}</p>
          </div>
        )}
      </div>

      {heardOnce && !question && (
        <button className="btn-primary" onClick={nextPass}>{UI.listen.ready}</button>
      )}

      {heardOnce && question && (
        <>
          <div className="card">
            <p className="prompt">
              {pass === 3 ? UI.prompts.vocabCloze : `${qIndex + 1} / ${questions.length}`}
            </p>
            {pass === 3 ? (
              <p className="sentence" lang="en">
                {question.q.split(BLANK)[0]}
                <span className={picked === null ? 'gap' : 'gap filled'}>
                  {picked === null ? '' : question.options[question.answer]}
                </span>
                {question.q.split(BLANK)[1]}
              </p>
            ) : (
              <p className="sentence">{question.q}</p>
            )}
          </div>

          <div className="choices" role="group">
            {question.options.map((option, i) => {
              let className = 'choice';
              if (picked !== null) {
                if (i === question.answer) className += ' correct';
                else if (i === picked) className += ' chosen-wrong';
                else className += ' dimmed';
              }
              return (
                <button key={option} className={className} onClick={() => answer(i)} disabled={picked !== null}>
                  <span className="marker" aria-hidden="true">
                    {picked !== null
                      ? i === question.answer ? '✓' : i === picked ? '✗' : String.fromCharCode(65 + i)
                      : String.fromCharCode(65 + i)}
                  </span>
                  <span lang={pass === 3 ? 'en' : undefined}>{option}</span>
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={nextQuestion} autoFocus>
              {qIndex + 1 >= questions.length ? UI.listen.ready : UI.nextQuestion}
            </button>
          )}
        </>
      )}
    </div>
  );
}

/** Shown after the fourth pass: the text and the translation, side by side. */
export function ListeningDone({
  passage,
  onAgain,
  onAnother,
}: {
  passage: Passage;
  onAgain: () => void;
  onAnother: () => void;
}) {
  return (
    <div>
      <h1>{UI.listen.finishTitle}</h1>
      <div className="card">
        <p>{UI.listen.finishLead}</p>
      </div>
      <div className="card">
        <h2>{UI.listen.transcript}</h2>
        <p lang="en">{passage.text}</p>
        {speechAvailable() && (
          <button className="speak" onClick={() => speak(passage.text, { rate: NATURAL_RATE })}>
            {UI.listen.replay}
          </button>
        )}
      </div>
      <div className="card">
        <h2>{UI.listen.translation}</h2>
        <p className="muted">{passage.ru}</p>
      </div>
      <div className="btn-row">
        <button className="btn-primary" onClick={onAgain}>{UI.listen.finishAgain}</button>
        <button className="btn-secondary" onClick={onAnother}>{UI.listen.finishAnother}</button>
      </div>
    </div>
  );
}
