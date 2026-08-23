import { useEffect, useMemo, useState } from 'react';
import type { Choice, Question } from '../engine/types';
import { Sentence } from './Sentence';
import { speak, speechAvailable, stopSpeaking } from './speech';
import { UI } from './strings';

export interface Answered {
  question: Question;
  chosen: Choice;
}

interface Props {
  questions: Question[];
  autoSpeak: boolean;
  onFinish: (answers: Answered[]) => void;
  onQuit: () => void;
}

export function Quiz({ questions, autoSpeak, onFinish, onQuit }: Props) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<Choice | null>(null);
  const [answers, setAnswers] = useState<Answered[]>([]);

  const question = questions[index];
  const correctChoice = useMemo(() => question?.choices.find((c) => c.correct), [question]);

  useEffect(() => {
    if (autoSpeak && question) speak(question.speak ?? question.text);
    return stopSpeaking;
  }, [question, autoSpeak]);

  if (!question) return null;

  const choose = (choice: Choice) => {
    if (chosen) return;
    setChosen(choice);
    setAnswers((prev) => [...prev, { question, chosen: choice }]);
    // Hearing the full, correct sentence right after answering is the moment
    // the correction lands, so it plays whether the answer was right or wrong.
    if (autoSpeak) speak(question.speak ?? question.text);
  };

  const next = () => {
    stopSpeaking();
    if (index + 1 >= questions.length) {
      onFinish(answers);
      return;
    }
    setChosen(null);
    setIndex(index + 1);
  };

  const wasRight = chosen?.correct ?? false;

  return (
    <div>
      <div className="topbar">
        <button onClick={() => { stopSpeaking(); onQuit(); }}>{UI.stop}</button>
        <span className="muted small">{UI.questionOf(index + 1, questions.length)}</span>
      </div>

      <div className="dots" aria-hidden="true">
        {questions.map((q, i) => {
          const answer = answers[i];
          const state = i === index && !chosen ? 'now' : answer ? (answer.chosen.correct ? 'right' : 'wrong') : '';
          return <i key={q.id + i} className={state} />;
        })}
      </div>

      <div className="card">
        <p className="prompt">{question.prompt}</p>
        <Sentence text={question.text} filled={chosen ? correctChoice?.text : undefined} />

        {speechAvailable() && (
          <button
            className="speak"
            onClick={() => speak(chosen ? (question.speak ?? question.text) : question.text.replace('␣', ''))}
          >
            {UI.hearIt}
          </button>
        )}
      </div>

      <div className="choices" role="group" aria-label={UI.answersLabel}>
        {question.choices.map((choice, i) => {
          const letter = String.fromCharCode(65 + i);
          let className = 'choice';
          if (chosen) {
            if (choice.correct) className += ' correct';
            else if (choice === chosen) className += ' chosen-wrong';
            else className += ' dimmed';
          }
          return (
            <button
              key={choice.text}
              className={className}
              onClick={() => choose(choice)}
              disabled={!!chosen}
              aria-label={`${letter}. ${choice.label ?? choice.text}`}
            >
              <span className="marker" aria-hidden="true">
                {chosen ? (choice.correct ? '✓' : choice === chosen ? '✗' : letter) : letter}
              </span>
              <span lang="en">{choice.label ?? choice.text}</span>
            </button>
          );
        })}
      </div>

      {chosen && (
        <>
          <div className={`verdict ${wasRight ? 'right' : 'wrong'}`}>
            <h3>{wasRight ? UI.correctHeading : UI.wrongHeading(correctChoice?.label ?? correctChoice?.text ?? '')}</h3>

            {/* A wrong answer is explained on its own terms first: not "here is
                the right one", but why the option she actually picked fails. */}
            {!wasRight && chosen.why && (
              <p>
                <strong>{UI.whyYoursWrong(chosen.label ?? chosen.text)}</strong> {chosen.why}
              </p>
            )}

            {/* Shown either way -- a correct answer is worth confirming out
                loud, not just marking green. */}
            {correctChoice?.why && (
              <p>
                <strong>{UI.whyThisRight}</strong> {correctChoice.why}
              </p>
            )}

            <p className="muted">{question.teaching}</p>
          </div>
          <button className="btn-primary" onClick={next} autoFocus>
            {index + 1 >= questions.length ? UI.seeResults : UI.nextQuestion}
          </button>
        </>
      )}
    </div>
  );
}
