/*
 * Calendar arithmetic and French date wording of `cw-timeline`. Internal: not exported by the
 * entry point. Days are local dates at midnight; differences are counted in calendar days, so a
 * daylight saving change never shifts a bar.
 */

const DAY = 86_400_000;

const DAY_MONTH = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const MONTH = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const WEEKDAY = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });

/** The same day at midnight. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Adds months, keeping the day within the target month (31 January + 1 month = 28 February). */
export function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const last = daysInMonth(target);
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), last));
}

/** Calendar days from `from` to `to` (negative when `to` is earlier). */
export function diffDays(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / DAY);
}

export function sameDay(a: Date, b: Date): boolean {
  return diffDays(a, b) === 0;
}

/** The Monday of the week of `date` (weeks start on Monday in France). */
export function mondayOf(date: Date): Date {
  return addDays(date, -((date.getDay() + 6) % 7));
}

export function firstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Working days (Monday to Friday) from `from` included to `to` excluded. */
export function workingDaysBetween(from: Date, to: Date): number {
  const total = diffDays(from, to);
  if (total <= 0) return 0;
  const weeks = Math.floor(total / 7);
  let count = weeks * 5;
  for (let day = addDays(from, weeks * 7); diffDays(day, to) > 0; day = addDays(day, 1)) {
    if (!isWeekend(day)) count += 1;
  }
  return count;
}

/** ISO 8601 week number (the week of the first Thursday is week 1). */
export function isoWeek(date: Date): number {
  // The Thursday of the week decides its year; count weeks from 1 January of that year.
  const thursday = addDays(date, 3 - ((date.getDay() + 6) % 7));
  const january = new Date(thursday.getFullYear(), 0, 1);
  return Math.floor(diffDays(january, thursday) / 7) + 1;
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
  if (sameDay(start, end)) return dayMonth(start);
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  return sameMonth
    ? `${String(start.getDate())} – ${dayMonth(end)}`
    : `${dayMonth(start)} – ${dayMonth(end)}`;
}

/** « du 10 au 13 nov. », « du 30 nov. au 2 déc. », or « le 10 nov. » for one day. */
export function rangeText(start: Date, end: Date): string {
  if (sameDay(start, end)) return `le ${dayMonth(start)}`;
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
  return `${from} → ${dayMonth(end)} · ${String(diffDays(start, end) + 1)} j`;
}
