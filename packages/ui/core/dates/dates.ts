/*
 * Plain `Date` arithmetic shared by the calendar, the calendar view, the date picker and the
 * timeline: local time, day precision, every result at midnight. No date library: the lint rule
 * rejects moment and date-fns, and Temporal is not in the compilation target yet.
 */

const DAY_MS = 86_400_000;

/**
 * The same day at midnight, local time.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵstartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * The first day of the month of `date`, at midnight.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵstartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * The first day of the week of `date`, at midnight. `weekStartsOn` is a `Date.getDay()` index: 1
 * (Monday, the French week and the default) or 0 (Sunday).
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵstartOfWeek(date: Date, weekStartsOn = 1): Date {
  return ɵaddDays(date, -((date.getDay() - weekStartsOn + 7) % 7));
}

/**
 * The day `days` calendar days after `date` (before when negative), at midnight: a daylight saving
 * change never shifts it by an hour.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵaddDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/**
 * The day `months` months after `date`, at midnight, the day clamped to the length of the target
 * month (31 January + 1 month = 28 or 29 February).
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵaddMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  return new Date(
    target.getFullYear(),
    target.getMonth(),
    Math.min(date.getDate(), ɵdaysInMonth(target)),
  );
}

/**
 * The number of days in the month of `date`.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵdaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * The number of calendar days from `from` to `to`, negative when `to` is earlier; the times of day
 * are ignored.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵdaysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / DAY_MS);
}

/**
 * A sortable number for the day of `date` (20261118), the same whatever its time of day: a map key
 * or a comparison of days.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵdayKey(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

/**
 * Whether two dates fall on the same day, whatever their times.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵsameDay(a: Date, b: Date): boolean {
  return ɵdayKey(a) === ɵdayKey(b);
}

/**
 * Whether two dates fall in the same month of the same year.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵsameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/**
 * The ISO 8601 week number of `date`: weeks start on Monday and week 1 holds the first Thursday of
 * the year, so 1 January can belong to week 52 or 53 of the year before.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵisoWeek(date: Date): number {
  // The Thursday of the week decides its year; count the weeks from 1 January of that year.
  const thursday = ɵaddDays(date, 3 - ((date.getDay() + 6) % 7));
  const january = new Date(thursday.getFullYear(), 0, 1);
  return Math.floor(ɵdaysBetween(january, thursday) / 7) + 1;
}
