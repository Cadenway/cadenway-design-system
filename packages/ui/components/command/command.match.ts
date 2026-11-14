/*
 * Text matching shared by the default filter and `cw-command-highlight`. Internal to the entry
 * point. Accents and case are ignored (« equipe » finds « Équipe »); decomposing then dropping the
 * marks normalizes the search; grapheme boundaries map matches back to the original label.
 */

/**
 * Type MatchRange
 *
 * @description
 * Half-open range `[start, end)` of matched characters in the original text.
 *
 * @type {readonly [number, number]}
 */
export type MatchRange = readonly [number, number];

/**
 * Function normalize
 *
 * @description
 * Removes combining marks and normalizes text to lowercase for matching.
 *
 * @param {string} text - Text to normalize.
 * @returns {string} Case- and accent-insensitive text.
 */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/**
 * Constant WORD_START
 *
 * @description
 * Characters that mark the beginning of a searchable word.
 *
 * @type {RegExp}
 */
const WORD_START: RegExp = /[\s\-_/.(«]/;

/**
 * Constant GRAPHEMES
 *
 * @description
 * Segments labels into user-perceived characters when the runtime supports it.
 *
 * @type {Intl.Segmenter | null}
 */
const GRAPHEMES: Intl.Segmenter | null =
  typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

/**
 * Function matchScore
 *
 * @description
 * How well `text` matches `search`: 1 at the start, 0.9 at a word start, 0.8 inside a word, less
 * for the letters in order with gaps (fuzzy), 0 when the letters are missing.
 *
 * @param {string} text - Candidate text to score.
 * @param {string} search - Search query.
 * @returns {number} Match score, with zero for a missing match.
 */
export function matchScore(text: string, search: string): number {
  const query: string = normalize(search).trim();
  if (!query) return 1;
  const haystack: string = normalize(text);
  const index: number = haystack.indexOf(query);
  if (index === 0) return 1;
  if (index > 0) return WORD_START.test(haystack.charAt(index - 1)) ? 0.9 : 0.8;
  let from: number = 0;
  let last: number = -1;
  let gaps: number = 0;
  for (const letter of query.replace(/\s+/g, '')) {
    const found: number = haystack.indexOf(letter, from);
    if (found < 0) return 0;
    if (last >= 0) gaps += found - last - 1;
    last = found + letter.length - 1;
    from = found + letter.length;
  }
  return Math.max(0.05, 0.5 - gaps * 0.02);
}

/**
 * Function matchRanges
 *
 * @description
 * Returns one span for a substring match or individual spans for a fuzzy match.
 *
 * @param {string} text - Candidate text to inspect.
 * @param {string} search - Search query.
 * @returns {readonly MatchRange[]} Matched ranges in the original text.
 */
export function matchRanges(text: string, search: string): readonly MatchRange[] {
  const query: string = normalize(search).trim();
  if (!query) return [];
  const haystack: string = normalize(text);
  const index: number = haystack.indexOf(query);
  const ranges: MatchRange[] = [];
  if (index >= 0) {
    ranges.push([index, index + query.length]);
  } else {
    let from: number = 0;
    for (const letter of query.replace(/\s+/g, '')) {
      const found: number = haystack.indexOf(letter, from);
      if (found < 0) return [];
      const end: number = found + letter.length;
      const previous: MatchRange | undefined = ranges.at(-1);
      if (previous?.[1] === found) ranges[ranges.length - 1] = [previous[0], end];
      else ranges.push([found, end]);
      from = end;
    }
  }

  // Older runtimes keep the previous normalized-offset behavior without failing to load the menu.
  if (!GRAPHEMES) return ranges;

  const starts: number[] = [];
  const ends: number[] = [];
  for (const part of GRAPHEMES.segment(text)) {
    const length: number = normalize(part.segment).length;
    for (let i: number = 0; i < length; i += 1) {
      starts.push(part.index);
      ends.push(part.index + part.segment.length);
    }
  }
  const original: MatchRange[] = [];
  for (const range of ranges) {
    const [start, end]: MatchRange = range;
    const first: number = starts[start];
    const last: number = ends[end - 1];
    const previous: MatchRange | undefined = original.at(-1);
    if (previous && first <= previous[1]) original[original.length - 1] = [previous[0], last];
    else original.push([first, last]);
  }
  return original;
}
