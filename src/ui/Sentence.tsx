import { BLANK } from '../engine/types';
import { capitalise, gapStartsSentence } from '../engine/build';

/**
 * Renders a question sentence, showing the gap as a visible underline before
 * the learner answers and as the filled-in word afterwards. Seeing the whole
 * correct sentence at the end is the part that teaches.
 */
export function Sentence({ text, filled }: { text: string; filled?: string }) {
  if (!text.includes(BLANK)) return <p className="sentence">{text}</p>;

  const [before, after] = text.split(BLANK);
  const isNoWord = filled === '—';
  const shown = filled && !isNoWord && gapStartsSentence(before) ? capitalise(filled) : filled;

  return (
    <p className="sentence">
      {before}
      {filled === undefined ? (
        <span className="gap" aria-label="blank" />
      ) : (
        <span className="gap filled">{isNoWord ? '—' : shown}</span>
      )}
      {after}
    </p>
  );
}
