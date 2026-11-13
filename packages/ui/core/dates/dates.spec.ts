import {
  ɵaddDays,
  ɵaddMonths,
  ɵdaysBetween,
  ɵdaysInMonth,
  ɵisoWeek,
  ɵsameDay,
  ɵsameMonth,
  ɵstartOfWeek,
} from './dates';

describe('core dates', () => {
  it('moves by days at midnight and counts calendar days', () => {
    expect(ɵaddDays(new Date(2026, 10, 30, 15, 45), 2)).toEqual(new Date(2026, 11, 2));
    expect(ɵdaysBetween(new Date(2026, 10, 30, 23), new Date(2026, 11, 2, 1))).toBe(2);
    expect(ɵdaysBetween(new Date(2026, 11, 2), new Date(2026, 10, 30))).toBe(-2);
  });

  it('clamps the day when moving by months', () => {
    expect(ɵaddMonths(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28));
    expect(ɵaddMonths(new Date(2028, 0, 31), 1)).toEqual(new Date(2028, 1, 29));
    expect(ɵdaysInMonth(new Date(2026, 3, 10))).toBe(30);
  });

  it('starts weeks on Monday by default, on Sunday on request', () => {
    // Wednesday 18 November 2026.
    expect(ɵstartOfWeek(new Date(2026, 10, 18, 9))).toEqual(new Date(2026, 10, 16));
    expect(ɵstartOfWeek(new Date(2026, 10, 18), 0)).toEqual(new Date(2026, 10, 15));
  });

  it('compares days and months whatever the time', () => {
    expect(ɵsameDay(new Date(2026, 10, 18, 1), new Date(2026, 10, 18, 23))).toBe(true);
    expect(ɵsameDay(new Date(2026, 10, 18), new Date(2026, 10, 19))).toBe(false);
    expect(ɵsameMonth(new Date(2026, 10, 1), new Date(2026, 10, 30))).toBe(true);
    expect(ɵsameMonth(new Date(2026, 10, 1), new Date(2025, 10, 1))).toBe(false);
  });

  it('numbers ISO weeks across year boundaries', () => {
    expect(ɵisoWeek(new Date(2026, 10, 18))).toBe(47);
    expect(ɵisoWeek(new Date(2027, 0, 1))).toBe(53);
    expect(ɵisoWeek(new Date(2026, 0, 1))).toBe(1);
    expect(ɵisoWeek(new Date(2024, 11, 30))).toBe(1);
  });
});
