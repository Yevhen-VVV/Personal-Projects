import type { Skill } from '../engine/types';
import { speak, speechAvailable } from './speech';
import { UI } from './strings';

export function LessonView({ skill, onStart, onBack }: { skill: Skill; onStart: () => void; onBack: () => void }) {
  return (
    <div>
      <div className="topbar">
        <button onClick={onBack}>{UI.back}</button>
        <span className="pill">{UI.categories[skill.category]}</span>
      </div>

      <h1>{skill.title}</h1>

      <div className="card">
        {skill.lesson.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="card">
        <h2>{UI.examples}</h2>
        <ul className="examples">
          {skill.lesson.examples.map((ex, i) => (
            <li key={i}>
              <div className="good-line" lang="en">
                {ex.good}{' '}
                {speechAvailable() && (
                  <button className="speak" onClick={() => speak(ex.good)} aria-label={`${UI.hearIt}: ${ex.good}`}>
                    🔊
                  </button>
                )}
              </div>
              {ex.bad && <div className="bad-line" lang="en">{ex.bad}</div>}
              {ex.note && <div className="muted small">{ex.note}</div>}
            </li>
          ))}
        </ul>
      </div>

      <button className="btn-primary" onClick={onStart}>
        {UI.startTopicPractice}
      </button>
    </div>
  );
}
