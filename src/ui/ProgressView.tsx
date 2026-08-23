import { ALL_SKILL_IDS, SKILL_BY_ID } from '../engine';
import type { Progress } from '../srs';
import { isDue, mastery, streakDays } from '../srs';
import { UI } from './strings';

export function ProgressView({ progress, onBack, onReset }: { progress: Progress; onBack: () => void; onReset: () => void }) {
  const { fraction, mastered, needsWork } = mastery(progress, ALL_SKILL_IDS);
  const accuracy = progress.totalAnswered
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
    : 0;

  const practised = ALL_SKILL_IDS.filter((id) => progress.skills[id]);

  return (
    <div>
      <div className="topbar">
        <button onClick={onBack}>{UI.back}</button>
      </div>
      <h1>{UI.progressTitle}</h1>

      <div className="card">
        <div className="skill-row"><span>{UI.answered}</span><strong>{progress.totalAnswered}</strong></div>
        <div className="skill-row"><span>{UI.correctShare}</span><strong>{accuracy}%</strong></div>
        <div className="skill-row"><span>{UI.daysInRow}</span><strong>{streakDays(progress)}</strong></div>
        <div className="skill-row"><span>{UI.topicsLearned}</span><strong>{mastered.length} / {ALL_SKILL_IDS.length}</strong></div>
      </div>

      <div className="card">
        <h2>{UI.overall}</h2>
        <div className="bar"><span style={{ width: `${fraction * 100}%` }} /></div>
        <p className="muted small" style={{ marginTop: '0.75rem' }}>
          {UI.overallHint}
        </p>
      </div>

      {needsWork.length > 0 && (
        <div className="card">
          <h2>{UI.needsWork}</h2>
          <div className="stack">
            {needsWork.map((id) => (
              <div key={id} className="skill-row">
                <span>{SKILL_BY_ID.get(id)?.title}</span>
                <span className="pill">{UI.comingSoon}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {practised.length > 0 && (
        <div className="card">
          <h2>{UI.everyTopic}</h2>
          {practised.map((id) => {
            const state = progress.skills[id]!;
            const total = state.correct + state.wrong;
            return (
              <div key={id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <span>{SKILL_BY_ID.get(id)?.title}</span>
                  <span className="muted small">
                    {state.correct}/{total} {isDue(state) ? UI.dueMark : ''}
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
          if (confirm(UI.resetConfirm)) onReset();
        }}
      >
        {UI.resetButton}
      </button>
    </div>
  );
}
