import {
  dayMonth,
  isWeekend,
  monthShort,
  moveText,
  periodText,
  rangeText,
  weekdayShort,
  workingDaysBetween,
} from './timeline.dates';

describe('timeline date helpers', () => {
  it('counts weekdays across weekends, whole weeks and daylight-saving changes', () => {
    expect(isWeekend(new Date(2026, 2, 28))).toBe(true);
    expect(isWeekend(new Date(2026, 2, 30))).toBe(false);
    expect(workingDaysBetween(new Date(2026, 2, 27), new Date(2026, 3, 7))).toBe(7);
    expect(workingDaysBetween(new Date(2026, 2, 30), new Date(2026, 2, 30))).toBe(0);
    expect(workingDaysBetween(new Date(2026, 2, 31), new Date(2026, 2, 30))).toBe(0);
  });

  it('formats single days and ranges within or across months', () => {
    const first: Date = new Date(2026, 10, 12);
    const sameMonth: Date = new Date(2026, 10, 14);
    const nextMonth: Date = new Date(2026, 11, 1);
    expect(weekdayShort(first, 'fr-FR')).toBe('je');
    expect(periodText(first, first, 'fr-FR')).toBe('12 nov.');
    expect(periodText(first, sameMonth, 'fr-FR')).toBe('12 – 14 nov.');
    expect(periodText(first, nextMonth, 'fr-FR')).toBe('12 nov. – 1 déc.');
    expect(rangeText(first, first, 'fr-FR')).toBe('le 12 nov.');
    expect(rangeText(first, sameMonth, 'fr-FR')).toBe('du 12 au 14 nov.');
    expect(rangeText(first, nextMonth, 'fr-FR')).toBe('du 12 nov. au 1 déc.');
    expect(moveText(first, sameMonth, 'fr-FR')).toBe('12 → 14 nov. · 3 j');
  });

  it('writes the dates of another locale, keeping both months when it writes the month first', () => {
    const first: Date = new Date(2026, 10, 12);
    const sameMonth: Date = new Date(2026, 10, 14);
    expect(weekdayShort(first, 'en-US')).toBe('Th');
    expect(monthShort(first, 'en-US')).toBe('Nov');
    expect(dayMonth(first, 'en-US')).toBe('Nov 12');
    expect(periodText(first, sameMonth, 'en-US')).toBe('Nov 12 – Nov 14');
    expect(periodText(first, sameMonth, 'en-GB')).toBe('12 – 14 Nov');
    expect(moveText(first, sameMonth, 'en-US')).toBe('Nov 12 → Nov 14 · 3 j');
  });
});
