import { isEmbedded, recognitionAvailable, type RecognitionError } from '../speech/recognition';
import { micNoticeKind } from './micNotice';
import { UI } from './strings';

/** Explains why the microphone is not working, in terms she can act on. */
export function MicNotice({ problem }: { problem?: RecognitionError | null }) {
  const kind = micNoticeKind({
    embedded: isEmbedded(),
    available: recognitionAvailable(),
    problem,
  });

  if (kind === 'none') return null;

  if (kind === 'embedded') {
    return (
      <div className="verdict wrong">
        <p>{UI.talk.embedded}</p>
        <p><strong lang="en">{UI.talk.appUrl}</strong></p>
      </div>
    );
  }

  return (
    <div className="verdict wrong">
      <p>{kind === 'no-permission' ? UI.talk.noPermission : UI.talk.noMic}</p>
    </div>
  );
}
