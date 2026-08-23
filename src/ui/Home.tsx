import type { Level } from '../engine/types';
import type { Progress } from '../srs';
import { mastery, streakDays } from '../srs';
import { ALL_SKILL_IDS } from '../engine';
import { TEXT_SIZES, type Settings } from './settings';
import { UI } from './strings';

interface Props {
  progress: Progress;
  settings: Settings;
  onSettings: (next: Settings) => void;
  onLevel: (level: Level) => void;
  onPractise: () => void;
  onTopics: () => void;
  onProgress: () => void;
}

const LEVELS: Level[] = [1, 2, 3];

export function Home({ progress, settings, onSettings, onLevel, onPractise, onTopics, onProgress }: Props) {
  const streak = streakDays(progress);
  const { fraction } = mastery(progress, ALL_SKILL_IDS);
  const returning = progress.totalAnswered > 0;

  return (
    <div>
      <h1>{UI.appTitle}</h1>
      <p className="muted">
        {returning ? UI.introBack : UI.introNew}
      </p>

      <div className="card">
        <button className="btn-primary" onClick={onPractise} style={{ fontSize: 'calc(1.4rem * var(--scale))' }}>
          {UI.startPractice}
        </button>
        <p className="muted small center" style={{ margin: '0.75rem 0 0' }}>
          {UI.practiceHint}
        </p>
      </div>

      <div className="btn-row">
        <button className="btn-secondary" onClick={onTopics}>
          {UI.chooseTopic}
        </button>
        <button className="btn-secondary" onClick={onProgress}>
          {UI.myProgress}
        </button>
      </div>

      {returning && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="skill-row">
            <span>{UI.answered}</span>
            <strong>{progress.totalAnswered}</strong>
          </div>
          <div className="skill-row">
            <span>{UI.daysInRow}</span>
            <strong>{streak}</strong>
          </div>
          <div className="skill-row">
            <span>{UI.overallProgress}</span>
            <strong>{Math.round(fraction * 100)}%</strong>
          </div>
        </div>
      )}

      <div className="card">
        <h2>{UI.difficultyTitle}</h2>
        <div className="stack">
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => onLevel(level)}
              style={progress.level === level ? { borderColor: 'var(--accent)', borderWidth: 3 } : undefined}
              aria-pressed={progress.level === level}
            >
              <strong>{UI.levels[level].label}</strong>
              <div className="muted small">{UI.levels[level].hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>{UI.readingTitle}</h2>
        <p className="muted small">{UI.textSize}</p>
        <div className="btn-row" style={{ marginBottom: '1rem' }}>
          {TEXT_SIZES.map((size) => (
            <button
              key={size.value}
              onClick={() => onSettings({ ...settings, textSize: size.value })}
              aria-pressed={settings.textSize === size.value}
              style={settings.textSize === size.value ? { borderColor: 'var(--accent)', borderWidth: 3 } : undefined}
            >
              {UI.sizes[size.value]}
            </button>
          ))}
        </div>

        <div className="btn-row">
          <button
            onClick={() => onSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            aria-pressed={settings.theme === 'dark'}
          >
            {settings.theme === 'dark' ? UI.darkOff : UI.darkOn}
          </button>
          <button
            onClick={() => onSettings({ ...settings, autoSpeak: !settings.autoSpeak })}
            aria-pressed={settings.autoSpeak}
            style={settings.autoSpeak ? { borderColor: 'var(--accent)', borderWidth: 3 } : undefined}
          >
            {settings.autoSpeak ? UI.speakOn : UI.speakOff}
          </button>
        </div>
      </div>
    </div>
  );
}
