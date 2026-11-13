import { formatDuration, parseDuration } from './duration';

const MINUTE = 60_000;

describe('parseDuration', () => {
  it.each([
    ['1 h 30', 90],
    ['1h30', 90],
    ['1 h 30 min', 90],
    ['1:30', 90],
    ['90 min', 90],
    ['90 mn', 90],
    ['1,5 h', 90],
    ['2 h', 120],
    ['45', 45],
  ])('reads « %s » as %i minutes', (text, minutes) => {
    expect(parseDuration(text)).toBe(minutes * MINUTE);
  });

  it('reads a bare number in hours for an estimate', () => {
    expect(parseDuration('3', { bareNumber: 'hours' })).toBe(180 * MINUTE);
    expect(parseDuration('2,5', { bareNumber: 'hours' })).toBe(150 * MINUTE);
  });

  it('refuses what is not a duration', () => {
    expect(parseDuration('')).toBeNull();
    expect(parseDuration('1h3O')).toBeNull();
    expect(parseDuration('douze')).toBeNull();
    expect(parseDuration('1,5')).toBeNull();
  });
});

describe('formatDuration', () => {
  it('writes hours and minutes, rounded to the minute', () => {
    expect(formatDuration(90 * MINUTE)).toBe('1 h 30');
    expect(formatDuration(180 * MINUTE)).toBe('3 h');
    expect(formatDuration(65 * MINUTE)).toBe('1 h 05');
    expect(formatDuration(48 * MINUTE + 20_000)).toBe('48 min');
  });

  it('writes the live clock of a running timer', () => {
    expect(formatDuration(42 * MINUTE + 10_000, { clock: true })).toBe('0:42:10');
    expect(formatDuration(0, { clock: true })).toBe('0:00:00');
  });
});
