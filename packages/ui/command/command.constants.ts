import { matchScore } from './command.match';
import type { CwCommandFilter } from './command.types';

/**
 * The default filter of `cw-command`: a fuzzy match that ignores case and accents. The label
 * scores 1 when it starts with the search, 0.9 when a word does, 0.8 when it contains it, less when
 * only its letters appear in order; a keyword match counts 90 %. 0 hides the item.
 */
export const cwCommandFuzzyFilter: CwCommandFilter = (value, search, keywords) =>
  Math.max(
    matchScore(value, search),
    ...keywords.map((keyword) => matchScore(keyword, search) * 0.9),
  );
