import type { Skill } from '../engine/types';
import { speak, speechAvailable } from './speech';

export function LessonView({ skill, onStart, onBack }: { skill: Skill; onStart: () => void; onBack: () => void }) {
  return (
    <div>
      <div className="topbar">
        <button onClick={onBack}>← Back</button>
        <span className="pill">{skill.category}</span>
      </div>

      <h1>{skill.title}</h1>

      <div className="card">
        {skill.lesson.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="card">
        <h2>Examples</h2>
        <ul className="examples">
          {skill.lesson.examples.map((ex, i) => (
            <li key={i}>
              <div className="good-line">
                {ex.good}{' '}
                {speechAvailable() && (
                  <button className="speak" onClick={() => speak(ex.good)} aria-label={`Hear: ${ex.good}`}>
                    🔊
                  </button>
                )}
              </div>
              {ex.bad && <div className="bad-line">{ex.bad}</div>}
              {ex.note && <div className="muted small">{ex.note}</div>}
            </li>
          ))}
        </ul>
      </div>

      <button className="btn-primary" onClick={onStart}>
        Start practice
      </button>
    </div>
  );
}
