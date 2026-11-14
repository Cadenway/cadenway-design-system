/*
 * Working days and French date wording of `cw-timeline`. Internal: not exported by the entry point.
 * The day arithmetic comes from `@cadenway/ui/core`: days are local dates at midnight and
 * differences are counted in calendar days, so a daylight saving change never shifts a bar.
 */

import { ɵaddDays, ɵdaysBetween, ɵsameDay } from '@cadenway/ui/core';

/**
 * Constant DAY_MONTH
 *
 * @description
 * French day and abbreviated month formatter.
 *
 * @type {Intl.DateTimeFormat}
 */
const DAY_MONTH: Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
});

/**
 * Constant MONTH
 *
 * @description
 * French abbreviated month formatter.
 *
 * @type {Intl.DateTimeFormat}
 */
const MONTH: Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', { month: 'short' });

/**
 * Constant WEEKDAY
 *
 * @description
 * French abbreviated weekday formatter.
 *
 * @type {Intl.DateTimeFormat}
 */
const WEEKDAY: Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });

/**
 * Function isWeekend
 *
 * @description
 * Checks whether a date is a Saturday or Sunday.
 *
 * @param {Date} date - Date to inspect.
 *
 * @returns {boolean} Whether the date is Saturday or Sunday.
 */
export function isWeekend(date: Date): boolean {
  const day: number = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Function workingDaysBetween
 *
 * @description
 * Counts weekdays from the first day inclusive to the last day exclusive.
 *
 * @param {Date} from - First day, included.
 * @param {Date} to - Last day, excluded.
 *
 * @returns {number} Number of weekdays in the interval.
 */
export function workingDaysBetween(from: Date, to: Date): number {
  const total: number = ɵdaysBetween(from, to);
  if (total <= 0) return 0;
  const weeks: number = Math.floor(total / 7);
  let count: number = weeks * 5;
  for (
    let day: Date = ɵaddDays(from, weeks * 7);
    ɵdaysBetween(day, to) > 0;
    day = ɵaddDays(day, 1)
  ) {
    if (!isWeekend(day)) count += 1;
  }
  return count;
}

/**
 * Function dayMonth
 *
 * @description
 * Formats a day and abbreviated month in French.
 *
 * @param {Date} date - Date to format.
 *
 * @returns {string} French day and abbreviated month.
 */
export function dayMonth(date: Date): string {
  return DAY_MONTH.format(date);
}

/**
 * Function monthShort
 *
 * @description
 * Formats an abbreviated French month.
 *
 * @param {Date} date - Date to format.
 *
 * @returns {string} Abbreviated French month.
 */
export function monthShort(date: Date): string {
  return MONTH.format(date);
}

/**
 * Function weekdayShort
 *
 * @description
 * Returns the two-letter French weekday used on the ruler.
 *
 * @param {Date} date - Date to format.
 *
 * @returns {string} Two-letter French weekday.
 */
export function weekdayShort(date: Date): string {
  return WEEKDAY.format(date).slice(0, 2);
}

/**
 * Function periodText
 *
 * @description
 * Formats a French date period, including both months when they differ.
 *
 * @param {Date} start - First day of the period.
 * @param {Date} end - Last day of the period.
 *
 * @returns {string} French period text.
 */
export function periodText(start: Date, end: Date): string {
  if (ɵsameDay(start, end)) return dayMonth(start);
  const sameMonth: boolean =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  return sameMonth
    ? `${String(start.getDate())} – ${dayMonth(end)}`
    : `${dayMonth(start)} – ${dayMonth(end)}`;
}

/**
 * Function rangeText
 *
 * @description
 * Formats a French date range or a single day.
 *
 * @param {Date} start - First day of the range.
 * @param {Date} end - Last day of the range.
 *
 * @returns {string} French date range or single-day text.
 */
export function rangeText(start: Date, end: Date): string {
  if (ɵsameDay(start, end)) return `le ${dayMonth(start)}`;
  const sameMonth: boolean =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  return sameMonth
    ? `du ${String(start.getDate())} au ${dayMonth(end)}`
    : `du ${dayMonth(start)} au ${dayMonth(end)}`;
}

/**
 * Function moveText
 *
 * @description
 * Formats the date range and inclusive day count for a moving bar.
 *
 * @param {Date} start - First day of the moved bar.
 * @param {Date} end - Last day of the moved bar.
 *
 * @returns {string} Date range and inclusive day count.
 */
export function moveText(start: Date, end: Date): string {
  const sameMonth: boolean =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const from: string = sameMonth ? String(start.getDate()) : dayMonth(start);
  return `${from} → ${dayMonth(end)} · ${String(ɵdaysBetween(start, end) + 1)} j`;
}
