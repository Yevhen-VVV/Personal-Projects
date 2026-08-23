import type { Skill, SkillId } from '../engine/types';
import type { Progress } from '../srs';
import { isDue } from '../srs';
import { UI } from './strings';

interface Props {
  skills: Skill[];
  progress: Progress;
  onPick: (id: SkillId) => void;
  onBack: () => void;
}

export function Topics({ skills, progress, onPick, onBack }: Props) {
  const groups = ['grammar', 'vocabulary', 'usage'] as const;

  return (
    <div>
      <div className="topbar">
        <button onClick={onBack}>{UI.back}</button>
      </div>
      <h1>{UI.topicsTitle}</h1>
      <p className="muted">{UI.topicsHint}</p>

      {groups.map((group) => (
        <div key={group} className="card">
          <h2>{UI.categories[group]}</h2>
          <div className="stack">
            {skills
              .filter((s) => s.category === group)
              .map((skill) => {
                const state = progress.skills[skill.id];
                const box = state?.box ?? 0;
                return (
                  <button key={skill.id} onClick={() => onPick(skill.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'baseline' }}>
                      <strong>{skill.title}</strong>
                      {state && <span className="pill">{box >= 4 ? UI.statusStrong : isDue(state) ? UI.statusDue : UI.statusLearning}</span>}
                    </div>
                    <div className="muted small">{skill.blurb}</div>
                    <div className="bar" style={{ marginTop: '0.5rem' }} aria-hidden="true">
                      <span style={{ width: `${(box / 5) * 100}%` }} />
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
