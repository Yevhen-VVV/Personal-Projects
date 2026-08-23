import type { Level } from '../engine/types';
import type { Progress } from '../srs';
import { mastery, streakDays } from '../srs';
import { ALL_SKILL_IDS } from '../engine';
import { TEXT_SIZES, type Settings } from './settings';

interface Props {
  progress: Progress;
  settings: Settings;
  onSettings: (next: Settings) => void;
  onLevel: (level: Level) => void;
  onPractise: () => void;
  onTopics: () => void;
  onProgress: () => void;
}

const LEVELS: { value: Level; label: string; hint: string }[] = [
  { value: 1, label: 'Beginner', hint: 'Everyday words and simple sentences' },
  { value: 2, label: 'Improving', hint: 'Longer sentences and more topics' },
  { value: 3, label: 'Confident', hint: 'Harder vocabulary and fine distinctions' },
];

export function Home({ progress, settings, onSettings, onLevel, onPractise, onTopics, onProgress }: Props) {
  const streak = streakDays(progress);
  const { fraction } = mastery(progress, ALL_SKILL_IDS);
  const returning = progress.totalAnswered > 0;

  return (
    <div>
      <h1>English Practice</h1>
      <p className="muted">
        {returning
          ? 'Welcome back. A few questions a day is all it takes.'
          : 'Short lessons and practice questions, at your own pace. Nothing is timed.'}
      </p>

      <div className="card">
        <button className="btn-primary" onClick={onPractise} style={{ fontSize: 'calc(1.4rem * var(--scale))' }}>
          Start today’s practice
        </button>
        <p className="muted small center" style={{ margin: '0.75rem 0 0' }}>
          12 questions, chosen for you. About five minutes.
        </p>
      </div>

      <div className="btn-row">
        <button className="btn-secondary" onClick={onTopics}>
          Choose a topic
        </button>
        <button className="btn-secondary" onClick={onProgress}>
          My progress
        </button>
      </div>

      {returning && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="skill-row">
            <span>Questions answered</span>
            <strong>{progress.totalAnswered}</strong>
          </div>
          <div className="skill-row">
            <span>Days in a row</span>
            <strong>{streak}</strong>
          </div>
          <div className="skill-row">
            <span>Overall progress</span>
            <strong>{Math.round(fraction * 100)}%</strong>
          </div>
        </div>
      )}

      <div className="card">
        <h2>How hard should the questions be?</h2>
        <div className="stack">
          {LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => onLevel(level.value)}
              style={progress.level === level.value ? { borderColor: 'var(--accent)', borderWidth: 3 } : undefined}
              aria-pressed={progress.level === level.value}
            >
              <strong>{level.label}</strong>
              <div className="muted small">{level.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Make it easier to read</h2>
        <p className="muted small">Text size</p>
        <div className="btn-row" style={{ marginBottom: '1rem' }}>
          {TEXT_SIZES.map((size) => (
            <button
              key={size.value}
              onClick={() => onSettings({ ...settings, textSize: size.value })}
              aria-pressed={settings.textSize === size.value}
              style={settings.textSize === size.value ? { borderColor: 'var(--accent)', borderWidth: 3 } : undefined}
            >
              {size.label}
            </button>
          ))}
        </div>

        <div className="btn-row">
          <button
            onClick={() => onSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            aria-pressed={settings.theme === 'dark'}
          >
            {settings.theme === 'dark' ? '☀️ Light background' : '🌙 Dark background'}
          </button>
          <button
            onClick={() => onSettings({ ...settings, autoSpeak: !settings.autoSpeak })}
            aria-pressed={settings.autoSpeak}
            style={settings.autoSpeak ? { borderColor: 'var(--accent)', borderWidth: 3 } : undefined}
          >
            {settings.autoSpeak ? '🔊 Reading aloud: on' : '🔇 Reading aloud: off'}
          </button>
        </div>
      </div>
    </div>
  );
}
