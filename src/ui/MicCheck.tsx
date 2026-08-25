import { useEffect, useRef, useState } from 'react';
import { createListener, isEmbedded, recognitionAvailable, type Listener } from '../speech/recognition';
import { MicNotice } from './MicNotice';
import { UI } from './strings';

/**
 * A microphone self-check.
 *
 * This exists because the app is used on a phone that whoever is fixing it
 * cannot hold. When speech input misbehaves there, "it does not work" is all
 * anyone can report; the engine's own events are the only thing that
 * distinguishes a blocked microphone from one that hears nothing from one
 * that hears fine and loses the transcript. Showing them turns a guessing
 * game into a bug report.
 */
export function MicCheck({ onBack }: { onBack: () => void }) {
  const [listening, setListening] = useState(false);
  const [settling, setSettling] = useState(false);
  const [text, setText] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const listenerRef = useRef<Listener | null>(null);

  useEffect(() => {
    listenerRef.current = createListener({
      onPartial: setText,
      onFinal: (final) => {
        setListening(false);
        setSettling(false);
        setText(final);
      },
      onError: (reason) => {
        setListening(false);
        setSettling(false);
        setLog((l) => [...l, `error: ${reason}`]);
      },
      onEvent: (name, detail) =>
        setLog((l) => [...l, detail ? `${name}: ${detail}` : name].slice(-40)),
    });
    return () => listenerRef.current?.cancel();
  }, []);

  const toggle = () => {
    const listener = listenerRef.current;
    if (!listener) return;
    if (listener.active) {
      listener.stop();
      setListening(false);
      setSettling(true);
      return;
    }
    setText('');
    setLog([]);
    listener.start();
    setListening(true);
  };

  const row = (label: string, ok: boolean) => (
    <div className="skill-row">
      <span>{label}</span>
      <strong>{ok ? UI.mic.yes : UI.mic.no}</strong>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <button onClick={onBack}>{UI.back}</button>
      </div>
      <h1>{UI.mic.title}</h1>
      <p className="muted">{UI.mic.hint}</p>

      <MicNotice />

      <div className="card">
        {row(UI.mic.supported, recognitionAvailable())}
        {row(UI.mic.secure, typeof window !== 'undefined' && window.isSecureContext)}
        {row(UI.mic.framed, isEmbedded())}
      </div>

      <button
        className={`mic ${listening ? 'on' : ''}`}
        onClick={toggle}
        aria-pressed={listening}
        disabled={settling || !recognitionAvailable()}
      >
        {settling ? UI.talk.thinking : listening ? UI.mic.stop : UI.mic.start}
      </button>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2>{UI.mic.result}</h2>
        <p className="phrase-en" lang="en">{text || UI.mic.nothing}</p>
        {text && <p className="muted small">{UI.mic.good}</p>}
        {!text && !listening && !settling && log.length > 0 && (
          <p className="muted small">{UI.mic.silent}</p>
        )}
      </div>

      {log.length > 0 && (
        <div className="card">
          <h2>{UI.mic.log}</h2>
          <ul className="examples">
            {log.map((entry, i) => (
              <li key={i} className="small" lang="en">{entry}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
