import { useCallback, useState } from 'react';
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

type View = 'home' | 'topics' | 'lesson' | 'quiz' | 'results' | 'progress';

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
        />
      )}

      {view === 'topics' && (
        <Topics
          skills={SKILLS}
          progress={progress}
          onPick={(id) => {
            setTopic(id);
            setView('lesson');
          }}
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
        <Quiz
          questions={questions}
          autoSpeak={settings.autoSpeak}
          onFinish={finish}
          onQuit={() => setView('home')}
        />
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
          onReset={() => {
            update({ ...srs.emptyProgress(), level: progress.level });
            setView('home');
          }}
        />
      )}
    </div>
  );
}
