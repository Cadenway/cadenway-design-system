import {
  isWeekend,
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
    expect(weekdayShort(first)).toBe('je');
    expect(periodText(first, first)).toBe('12 nov.');
    expect(periodText(first, sameMonth)).toBe('12 – 14 nov.');
    expect(periodText(first, nextMonth)).toBe('12 nov. – 1 déc.');
    expect(rangeText(first, first)).toBe('le 12 nov.');
    expect(rangeText(first, sameMonth)).toBe('du 12 au 14 nov.');
    expect(rangeText(first, nextMonth)).toBe('du 12 nov. au 1 déc.');
    expect(moveText(first, sameMonth)).toBe('12 → 14 nov. · 3 j');
  });
});
