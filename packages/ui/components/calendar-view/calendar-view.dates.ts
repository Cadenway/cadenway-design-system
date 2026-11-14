/*
 * The time-of-day helpers of the calendar view, in local time. The day arithmetic comes from
 * `@cadenway/ui/core`; only `addDays` stays here because the week view moves timed items by whole
 * days and keeps their hour. Internal to the entry point.
 */

/**
 * Function addDays
 *
 * @description
 * `date` moved by `days` calendar days, its hour and minutes kept (daylight saving changes too), unlike `ɵaddDays` of `@cadenway/ui/core`, which returns midnight.
 *
 * @param {Date} date - Date used by the operation.
 * @param {number} days - Number of calendar days to move, or days to lay out.
 * @returns {Date} Date shifted by the given number of days.
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

/**
 * Function minutesOf
 *
 * @description
 * The minutes since midnight of `date`.
 *
 * @param {Date} date - Date used by the operation.
 * @returns {number} Minutes since midnight.
 */
export function minutesOf(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Function atMinutes
 *
 * @description
 * The day of `date` at `minutes` after midnight.
 *
 * @param {Date} date - Date used by the operation.
 * @param {number} minutes - Minutes after midnight.
 * @returns {Date} Date at the requested time.
 */
export function atMinutes(date: Date, minutes: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, minutes);
}

/**
 * Function formatTime
 *
 * @description
 * « 9:30 », as the mockup writes hours.
 *
 * @param {number} minutes - Minutes after midnight.
 * @returns {string} Formatted hour and minute.
 */
export function formatTime(minutes: number): string {
  const hours: number = Math.floor(minutes / 60);
  return `${String(hours)}:${String(minutes % 60).padStart(2, '0')}`;
}
