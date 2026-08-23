import { ALL_SKILL_IDS, SKILL_BY_ID } from '../engine';
import type { Progress } from '../srs';
import { isDue, mastery, streakDays } from '../srs';

export function ProgressView({ progress, onBack, onReset }: { progress: Progress; onBack: () => void; onReset: () => void }) {
  const { fraction, mastered, needsWork } = mastery(progress, ALL_SKILL_IDS);
  const accuracy = progress.totalAnswered
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
    : 0;

  const practised = ALL_SKILL_IDS.filter((id) => progress.skills[id]);

  return (
    <div>
      <div className="topbar">
        <button onClick={onBack}>← Back</button>
      </div>
      <h1>My progress</h1>

      <div className="card">
        <div className="skill-row"><span>Questions answered</span><strong>{progress.totalAnswered}</strong></div>
        <div className="skill-row"><span>Answered correctly</span><strong>{accuracy}%</strong></div>
        <div className="skill-row"><span>Days in a row</span><strong>{streakDays(progress)}</strong></div>
        <div className="skill-row"><span>Topics learned well</span><strong>{mastered.length} of {ALL_SKILL_IDS.length}</strong></div>
      </div>

      <div className="card">
        <h2>Overall</h2>
        <div className="bar"><span style={{ width: `${fraction * 100}%` }} /></div>
        <p className="muted small" style={{ marginTop: '0.75rem' }}>
          This grows as you answer each topic correctly several times, on different days.
        </p>
      </div>

      {needsWork.length > 0 && (
        <div className="card">
          <h2>Needs a little more work</h2>
          <div className="stack">
            {needsWork.map((id) => (
              <div key={id} className="skill-row">
                <span>{SKILL_BY_ID.get(id)?.title}</span>
                <span className="pill">Coming up soon</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {practised.length > 0 && (
        <div className="card">
          <h2>Every topic</h2>
          {practised.map((id) => {
            const state = progress.skills[id]!;
            const total = state.correct + state.wrong;
            return (
              <div key={id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <span>{SKILL_BY_ID.get(id)?.title}</span>
                  <span className="muted small">
                    {state.correct}/{total} {isDue(state) ? '· due' : ''}
                  </span>
                </div>
                <div className="bar" style={{ marginTop: '0.4rem' }}><span style={{ width: `${(state.box / 5) * 100}%` }} /></div>
              </div>
            );
          })}
        </div>
      )}

      <button
        className="btn-secondary"
        onClick={() => {
          if (confirm('This will erase all your progress and start again. Are you sure?')) onReset();
        }}
      >
        Start again from the beginning
      </button>
    </div>
  );
}
