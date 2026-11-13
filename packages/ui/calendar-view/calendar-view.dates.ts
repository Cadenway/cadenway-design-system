/*
 * Plain `Date` arithmetic for the calendar view, in local time. No date library: the lint rule
 * rejects moment and date-fns, and Temporal is not in the compilation target yet. The day helpers
 * repeat those of `@cadenway/ui/calendar`, which keeps them internal. Internal to the entry point.
 */

/** The same day at midnight, local time. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The first day of the month of `date`, at midnight. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** The first day of the week of `date` (`weekStartsOn` 1: Monday, 0: Sunday), at midnight. */
export function startOfWeek(date: Date, weekStartsOn: number): Date {
  return addDays(startOfDay(date), -((date.getDay() - weekStartsOn + 7) % 7));
}

/** `date` moved by `days` calendar days, its time of day kept (daylight saving changes too). */
export function addDays(date: Date, days: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
    date.getHours(),
    date.getMinutes(),
  );
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

/** The number of calendar days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86_400_000);
}

/** Whether two dates fall on the same day. */
export function sameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}

/** Whether two dates fall in the same month. */
export function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** The minutes since midnight of `date`. */
export function minutesOf(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** The day of `date` at `minutes` after midnight. */
export function atMinutes(date: Date, minutes: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, minutes);
}

/** « 9:30 », as the mockup writes hours. */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  return `${String(hours)}:${String(minutes % 60).padStart(2, '0')}`;
}
