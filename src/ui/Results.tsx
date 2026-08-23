import type { Answered } from './Quiz';
import { SKILL_BY_ID } from '../engine';
import { Sentence } from './Sentence';

interface Props {
  answers: Answered[];
  onAgain: () => void;
  onHome: () => void;
}

export function Results({ answers, onAgain, onHome }: Props) {
  const right = answers.filter((a) => a.chosen.correct).length;
  const missed = answers.filter((a) => !a.chosen.correct);

  // Which topics the misses clustered in -- far more useful to the learner
  // than a score, because it says what to do next.
  const byTopic = new Map<string, number>();
  for (const miss of missed) {
    const title = SKILL_BY_ID.get(miss.question.skill)?.title ?? miss.question.skill;
    byTopic.set(title, (byTopic.get(title) ?? 0) + 1);
  }

  return (
    <div>
      <h1>Well done</h1>

      <div className="card center">
        <p className="sentence" style={{ marginBottom: '0.5rem' }}>
          {right} out of {answers.length}
        </p>
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${answers.length ? (right / answers.length) * 100 : 0}%` }} />
        </div>
        <p className="muted small" style={{ marginTop: '0.75rem' }}>
          {missed.length === 0
            ? 'Every answer correct. That is a very good session.'
            : 'The questions you missed will come back again soon, so you get another go at them.'}
        </p>
      </div>

      {byTopic.size > 0 && (
        <div className="card">
          <h2>Worth another look</h2>
          <div className="stack">
            {[...byTopic.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([title, count]) => (
                <div key={title} className="skill-row">
                  <span>{title}</span>
                  <span className="pill">{count} missed</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {missed.length > 0 && (
        <div className="card">
          <h2>Your mistakes</h2>
          <div className="stack">
            {missed.map((miss, i) => {
              const correct = miss.question.choices.find((c) => c.correct);
              return (
                <div key={i} style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--line)' }}>
                  <Sentence text={miss.question.text} filled={correct?.text} />
                  <p className="small muted" style={{ margin: 0 }}>
                    You chose “{miss.chosen.text}”. {miss.question.teaching}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="btn-row">
        <button className="btn-primary" onClick={onAgain}>
          Practise again
        </button>
        <button className="btn-secondary" onClick={onHome}>
          Finish
        </button>
      </div>
    </div>
  );
}
