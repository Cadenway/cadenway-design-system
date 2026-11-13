/*
 * Text matching shared by the default filter and `cw-command-highlight`. Internal to the entry
 * point. Accents and case are ignored (« equipe » finds « Équipe »); decomposing then dropping the
 * marks keeps one character per letter of NFC text, so match positions map back to the label.
 */

/** A half-open range `[start, end)` of matched characters in the original text. */
export type MatchRange = readonly [number, number];

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

const WORD_START = /[\s\-_/.(«]/;

/**
 * How well `text` matches `search`: 1 at the start, 0.9 at a word start, 0.8 inside a word, less
 * for the letters in order with gaps (fuzzy), 0 when the letters are missing.
 */
export function matchScore(text: string, search: string): number {
  const query = normalize(search).trim();
  if (!query) return 1;
  const haystack = normalize(text);
  const index = haystack.indexOf(query);
  if (index === 0) return 1;
  if (index > 0) return WORD_START.test(haystack.charAt(index - 1)) ? 0.9 : 0.8;
  let from = 0;
  let last = -1;
  let gaps = 0;
  for (const letter of query.replace(/\s+/g, '')) {
    const found = haystack.indexOf(letter, from);
    if (found < 0) return 0;
    if (last >= 0) gaps += found - last - 1;
    last = found;
    from = found + 1;
  }
  return Math.max(0.05, 0.5 - gaps * 0.02);
}

/** The ranges of `text` that `search` matches: one span for a substring, letters for a fuzzy match. */
export function matchRanges(text: string, search: string): readonly MatchRange[] {
  const query = normalize(search).trim();
  if (!query) return [];
  const haystack = normalize(text);
  const index = haystack.indexOf(query);
  if (index >= 0) return [[index, index + query.length]];
  const ranges: MatchRange[] = [];
  let from = 0;
  for (const letter of query.replace(/\s+/g, '')) {
    const found = haystack.indexOf(letter, from);
    if (found < 0) return [];
    const previous = ranges.at(-1);
    if (previous?.[1] === found) ranges[ranges.length - 1] = [previous[0], found + 1];
    else ranges.push([found, found + 1]);
    from = found + 1;
  }
  return ranges;
}
