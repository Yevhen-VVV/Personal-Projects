import { useCallback, useMemo, useState } from 'react';
import { ALL_SKILL_IDS, SKILL_BY_ID, generateSession } from './engine';
import type { Level, Question, SkillId } from './engine/types';
import * as srs from './srs';
import { useSettings } from './ui/settings';
import { Home } from './ui/Home';
import { Topics } from './ui/Topics';
import { LessonView } from './ui/Lesson';
import { Quiz, type Answered } from './ui/Quiz';
import { Results } from './ui/Results';
import { ProgressView } from './ui/ProgressView';
import { SKILLS } from './engine/skills';
import { Picker } from './ui/Picker';
import { RolePlay, RolePlayReview, type TurnResult } from './ui/RolePlay';
import { Listening, ListeningDone } from './ui/Listening';
import { Shadowing } from './ui/Shadowing';
import { SCENARIOS } from './engine/corpus/scenarios';
import { PASSAGES, spokenSeconds } from './engine/corpus/listening';
import { GROUP_TITLES, PHRASES, type PhraseGroup } from './engine/corpus/survival';
import { dailyPhrases } from './engine/drill';
import { UI } from './ui/strings';

type View =
  | 'home'
  | 'topics'
  | 'lesson'
  | 'quiz'
  | 'results'
  | 'progress'
  | 'talk-pick'
  | 'talk'
  | 'talk-review'
  | 'listen-pick'
  | 'listen'
  | 'listen-done'
  | 'phrases-pick'
  | 'shadow';

/** Questions in a mixed daily session, and in a single-topic session. */
const DAILY_COUNT = 12;
const TOPIC_COUNT = 10;

export default function App() {
  const [settings, setSettings] = useSettings();
  const [progress, setProgress] = useState<srs.Progress>(srs.load);
  const [view, setView] = useState<View>('home');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answered[]>([]);
  const [topic, setTopic] = useState<SkillId | null>(null);

  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [turnResults, setTurnResults] = useState<TurnResult[]>([]);
  const [passageId, setPassageId] = useState<string | null>(null);
  const [drillGroup, setDrillGroup] = useState<PhraseGroup | 'daily' | null>(null);

  const update = useCallback((next: srs.Progress) => {
    setProgress(next);
    srs.save(next);
  }, []);

  const startDaily = useCallback(() => {
    setTopic(null);
    setQuestions(
      generateSession({
        skills: ALL_SKILL_IDS,
        level: progress.level,
        count: DAILY_COUNT,
        // A fresh seed each session, so two sessions on the same day differ.
        seed: Date.now() >>> 0,
        weights: srs.weights(progress, ALL_SKILL_IDS),
      }),
    );
    setView('quiz');
  }, [progress]);

  const startTopic = useCallback(
    (skill: SkillId) => {
      setTopic(skill);
      setQuestions(
        generateSession({ skills: [skill], level: progress.level, count: TOPIC_COUNT, seed: Date.now() >>> 0 }),
      );
      setView('quiz');
    },
    [progress.level],
  );

  const finish = useCallback(
    (given: Answered[]) => {
      let next = progress;
      for (const answer of given) next = srs.record(next, answer.question.skill, answer.chosen.correct);
      if (given.length) next = srs.markDayComplete(next);
      update(next);
      setAnswers(given);
      setView('results');
    },
    [progress, update],
  );

  const scenario = useMemo(() => SCENARIOS.find((s) => s.id === scenarioId) ?? null, [scenarioId]);
  const passage = useMemo(() => PASSAGES.find((p) => p.id === passageId) ?? null, [passageId]);

  const drillPhrases = useMemo(() => {
    if (drillGroup === 'daily') return dailyPhrases(progress.level);
    if (!drillGroup) return [];
    return PHRASES.filter((p) => p.group === drillGroup && p.level <= progress.level);
  }, [drillGroup, progress.level]);

  return (
    <div className="app">
      {view === 'home' && (
        <Home
          progress={progress}
          settings={settings}
          onSettings={setSettings}
          onLevel={(level: Level) => update({ ...progress, level })}
          onPractise={startDaily}
          onTopics={() => setView('topics')}
          onProgress={() => setView('progress')}
          onTalk={() => setView('talk-pick')}
          onListen={() => setView('listen-pick')}
          onPhrases={() => setView('phrases-pick')}
        />
      )}

      {view === 'topics' && (
        <Topics
          skills={SKILLS}
          progress={progress}
          onPick={(id) => { setTopic(id); setView('lesson'); }}
          onBack={() => setView('home')}
        />
      )}

      {view === 'lesson' && topic && (
        <LessonView
          skill={SKILL_BY_ID.get(topic)!}
          onStart={() => startTopic(topic)}
          onBack={() => setView('topics')}
        />
      )}

      {view === 'quiz' && (
        <Quiz questions={questions} autoSpeak={settings.autoSpeak} onFinish={finish} onQuit={() => setView('home')} />
      )}

      {view === 'results' && (
        <Results
          answers={answers}
          onAgain={() => (topic ? startTopic(topic) : startDaily())}
          onHome={() => setView('home')}
        />
      )}

      {view === 'progress' && (
        <ProgressView
          progress={progress}
          onBack={() => setView('home')}
          onReset={() => { update({ ...srs.emptyProgress(), level: progress.level }); setView('home'); }}
        />
      )}

      {/* ---- speaking ---- */}

      {view === 'talk-pick' && (
        <Picker
          title={UI.talk.pickTitle}
          hint={UI.talk.pickHint}
          items={SCENARIOS.map((s) => ({ id: s.id, title: s.title, detail: s.setting }))}
          onPick={(id) => { setScenarioId(id); setView('talk'); }}
          onBack={() => setView('home')}
        />
      )}

      {view === 'talk' && scenario && (
        <RolePlay
          key={scenario.id + turnResults.length}
          scenario={scenario}
          onDone={(results) => { setTurnResults(results); setView('talk-review'); }}
          onQuit={() => setView('talk-pick')}
        />
      )}

      {view === 'talk-review' && scenario && (
        <RolePlayReview
          scenario={scenario}
          results={turnResults}
          onAgain={() => { setTurnResults([]); setView('talk'); }}
          onAnother={() => { setTurnResults([]); setView('talk-pick'); }}
        />
      )}

      {/* ---- listening ---- */}

      {view === 'listen-pick' && (
        <Picker
          title={UI.listen.pickTitle}
          hint={UI.listen.pickHint}
          items={PASSAGES.map((p) => ({
            id: p.id,
            title: p.title,
            detail: p.setting,
            badge: `~${spokenSeconds(p.text)} сек.`,
          }))}
          onPick={(id) => { setPassageId(id); setView('listen'); }}
          onBack={() => setView('home')}
        />
      )}

      {view === 'listen' && passage && (
        <Listening
          key={passage.id}
          passage={passage}
          onDone={() => setView('listen-done')}
          onQuit={() => setView('listen-pick')}
        />
      )}

      {view === 'listen-done' && passage && (
        <ListeningDone
          passage={passage}
          onAgain={() => setView('listen')}
          onAnother={() => setView('listen-pick')}
        />
      )}

      {/* ---- survival phrases ---- */}

      {view === 'phrases-pick' && (
        <Picker
          title={UI.phrases.pickTitle}
          hint={UI.phrases.pickHint}
          items={(Object.keys(GROUP_TITLES) as PhraseGroup[]).map((group) => ({
            id: group,
            title: GROUP_TITLES[group],
            detail: `${PHRASES.filter((p) => p.group === group).length} фраз`,
          }))}
          onPick={(id) => { setDrillGroup(id as PhraseGroup); setView('shadow'); }}
          onBack={() => setView('home')}
          extra={
            <div className="card">
              <button
                className="btn-primary"
                onClick={() => { setDrillGroup('daily'); setView('shadow'); }}
              >
                {UI.phrases.dailyDrill}
              </button>
              <p className="muted small center" style={{ margin: '0.75rem 0 0' }}>{UI.phrases.dailyHint}</p>
            </div>
          }
        />
      )}

      {view === 'shadow' && drillPhrases.length > 0 && (
        <Shadowing
          key={String(drillGroup)}
          phrases={drillPhrases}
          onDone={() => { update(srs.markDayComplete(progress)); setView('phrases-pick'); }}
          onQuit={() => setView('phrases-pick')}
        />
      )}
    </div>
  );
}
