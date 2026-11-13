/*
 * Plain `Date` arithmetic for the calendar, in local time and at day precision. No date library:
 * the lint rule rejects moment and date-fns, and Temporal is not in the compilation target yet.
 * Internal to the entry point.
 */

/** The same day at midnight, local time. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The first day of the month of `date`, at midnight. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** `date` moved by `days` calendar days (daylight saving changes keep midnight). */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** `date` moved by `months`, the day clamped to the length of the target month (31 → 30). */
export function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const length = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), length));
}

/** A sortable number for the day of `date` (20261118), stable across time zones and times. */
export function dayKey(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

/** Whether two dates fall on the same day. */
export function sameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}

/** Whether two dates fall in the same month. */
export function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** The ISO 8601 week number of `date`: weeks start on Monday, week 1 holds the first Thursday. */
export function isoWeek(date: Date): number {
  const thursday = addDays(date, 3 - ((date.getDay() + 6) % 7));
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const firstWeekThursday = addDays(firstThursday, 3 - ((firstThursday.getDay() + 6) % 7));
  return 1 + Math.round((thursday.getTime() - firstWeekThursday.getTime()) / (7 * 86_400_000));
}
