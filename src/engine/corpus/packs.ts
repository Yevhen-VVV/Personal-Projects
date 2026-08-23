import type { SkillId } from '../types';
import type { AuthoredItem } from './authored';

/**
 * AI-generated content packs.
 *
 * This file is written by `npm run pack -- <skill>`, which asks Claude for new
 * items in the style of the hand-written corpus, validates every one, and
 * appends the survivors here. It is checked into the repository on purpose:
 * the app never calls an API at runtime, so a learner needs no key, no
 * account, and no connection, and the content can be reviewed in a diff before
 * anyone practises with it.
 */
export const PACKS: Partial<Record<SkillId, AuthoredItem[]>> = {};
