/*
 * Working days and French date wording of `cw-timeline`. Internal: not exported by the entry point.
 * The day arithmetic comes from `@cadenway/ui/core`: days are local dates at midnight and
 * differences are counted in calendar days, so a daylight saving change never shifts a bar.
 */

import { ɵaddDays, ɵdaysBetween, ɵsameDay } from '@cadenway/ui/core';

const DAY_MONTH = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const MONTH = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const WEEKDAY = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });

/** Whether `date` is a Saturday or a Sunday, shaded on the ruler. */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Working days (Monday to Friday) from `from` included to `to` excluded. */
export function workingDaysBetween(from: Date, to: Date): number {
  const total = ɵdaysBetween(from, to);
  if (total <= 0) return 0;
  const weeks = Math.floor(total / 7);
  let count = weeks * 5;
  for (let day = ɵaddDays(from, weeks * 7); ɵdaysBetween(day, to) > 0; day = ɵaddDays(day, 1)) {
    if (!isWeekend(day)) count += 1;
  }
  return count;
}

/** « 9 nov. » */
export function dayMonth(date: Date): string {
  return DAY_MONTH.format(date);
}

/** « nov. » */
export function monthShort(date: Date): string {
  return MONTH.format(date);
}

/** « lu », the two-letter weekday of the ruler. */
export function weekdayShort(date: Date): string {
  return WEEKDAY.format(date).slice(0, 2);
}

/** « 9 – 15 nov. », or « 23 nov. – 4 déc. » across two months. */
export function periodText(start: Date, end: Date): string {
  if (ɵsameDay(start, end)) return dayMonth(start);
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  return sameMonth
    ? `${String(start.getDate())} – ${dayMonth(end)}`
    : `${dayMonth(start)} – ${dayMonth(end)}`;
}

/** « du 10 au 13 nov. », « du 30 nov. au 2 déc. », or « le 10 nov. » for one day. */
export function rangeText(start: Date, end: Date): string {
  if (ɵsameDay(start, end)) return `le ${dayMonth(start)}`;
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  return sameMonth
    ? `du ${String(start.getDate())} au ${dayMonth(end)}`
    : `du ${dayMonth(start)} au ${dayMonth(end)}`;
}

/** « 24 → 26 nov. · 3 j », the tooltip of a bar being moved. */
export function moveText(start: Date, end: Date): string {
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const from = sameMonth ? String(start.getDate()) : dayMonth(start);
  return `${from} → ${dayMonth(end)} · ${String(ɵdaysBetween(start, end) + 1)} j`;
}
