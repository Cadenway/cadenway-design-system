import { matchRanges, matchScore } from './command.match';

describe('command matching', () => {
  it('maps matches back to decomposed accents in the original label', () => {
    expect(matchRanges('Cafe\u0301 noir', 'noir')).toEqual([[6, 10]]);
    expect(matchRanges('e\u0301quipe', 'e')).toEqual([[0, 2]]);
  });

  it('keeps an emoji grapheme intact when highlighting part of it', () => {
    expect(matchRanges('👩‍💻 code', '💻')).toEqual([[0, 5]]);
  });

  it('matches supplementary characters correctly in fuzzy searches', () => {
    expect(matchRanges('😀 a', '😀a')).toEqual([
      [0, 2],
      [3, 4],
    ]);
    expect(matchScore('😀 a', '😀a')).toBe(0.48);
  });
});
