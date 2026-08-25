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
  onTalk: () => void;
  onListen: () => void;
  onPhrases: () => void;
  onMicCheck: () => void;
}

const LEVELS: Level[] = [1, 2, 3];

export function Home({
  progress,
  settings,
  onSettings,
  onLevel,
  onPractise,
  onTopics,
  onProgress,
  onTalk,
  onListen,
  onPhrases,
  onMicCheck,
}: Props) {
  const streak = streakDays(progress);
  const { fraction } = mastery(progress, ALL_SKILL_IDS);
  const returning = progress.totalAnswered > 0;

  return (
    <div>
      <h1>{UI.appTitle}</h1>
      <p className="muted">
        {returning ? UI.introBack : UI.introNew}
      </p>

      {/* Speaking comes first. Reading and tapping are comfortable; saying it
          out loud is the thing she avoids, so it is the thing the app opens on. */}
      <div className="card">
        <button className="btn-primary" onClick={onTalk} style={{ fontSize: 'calc(1.4rem * var(--scale))' }}>
          🗣 {UI.talk.tile}
        </button>
        <p className="muted small center" style={{ margin: '0.75rem 0 0' }}>{UI.talk.tileHint}</p>
      </div>

      <div className="stack" style={{ marginBottom: '1rem' }}>
        <button onClick={onPractise}>
          <strong>{UI.startPractice}</strong>
          <div className="muted small">{UI.practiceHint}</div>
        </button>
        <button onClick={onListen}>
          <strong>👂 {UI.listen.tile}</strong>
          <div className="muted small">{UI.listen.tileHint}</div>
        </button>
        <button onClick={onPhrases}>
          <strong>💬 {UI.phrases.tile}</strong>
          <div className="muted small">{UI.phrases.tileHint}</div>
        </button>
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
          <button onClick={onMicCheck}>{UI.mic.tile}</button>
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
