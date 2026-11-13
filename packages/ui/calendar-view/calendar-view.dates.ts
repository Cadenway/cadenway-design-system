/*
 * The time-of-day helpers of the calendar view, in local time. The day arithmetic comes from
 * `@cadenway/ui/core`; only `addDays` stays here because the week view moves timed items by whole
 * days and keeps their hour. Internal to the entry point.
 */

/**
 * `date` moved by `days` calendar days, its hour and minutes kept (daylight saving changes too),
 * unlike `ɵaddDays` of `@cadenway/ui/core`, which returns midnight.
 */
export function addDays(date: Date, days: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
    date.getHours(),
    date.getMinutes(),
  );
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
