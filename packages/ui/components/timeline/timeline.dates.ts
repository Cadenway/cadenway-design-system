/*
 * Working days and date wording of `cw-timeline`, in the locale given by `provideCwLocale`
 * (French by default). Internal: not exported by the entry point.
 * The day arithmetic comes from `@cadenway/ui/core`: days are local dates at midnight and
 * differences are counted in calendar days, so a daylight saving change never shifts a bar.
 */

import { ɵaddDays, ɵdaysBetween, ɵperLocale, ɵsameDay } from '@cadenway/ui/core';

/**
 * Interface TimelineFormats
 *
 * @description
 * The `Intl` formatters of the timeline in one locale, and how it orders a day and a month.
 */
interface TimelineFormats {
  // #region Properties
  /**
   * Property day
   *
   * @description
   * Day of the month alone (« 12 » in French).
   *
   * @type {Intl.DateTimeFormat}
   * @readonly
   */
  readonly day: Intl.DateTimeFormat;

  /**
   * Property dayMonth
   *
   * @description
   * Day and abbreviated month (« 12 nov. » in French, « Nov 12 » in American English).
   *
   * @type {Intl.DateTimeFormat}
   * @readonly
   */
  readonly dayMonth: Intl.DateTimeFormat;

  /**
   * Property month
   *
   * @description
   * Abbreviated month.
   *
   * @type {Intl.DateTimeFormat}
   * @readonly
   */
  readonly month: Intl.DateTimeFormat;

  /**
   * Property weekday
   *
   * @description
   * Abbreviated weekday.
   *
   * @type {Intl.DateTimeFormat}
   * @readonly
   */
  readonly weekday: Intl.DateTimeFormat;

  /**
   * Property dayFirst
   *
   * @description
   * Whether the locale writes the day before the month: a range within one month then drops the
   * first month (« 12 – 14 nov. »); otherwise both days keep it (« Nov 12 – Nov 14 »).
   *
   * @type {boolean}
   * @readonly
   */
  readonly dayFirst: boolean;
  // #endregion
}

/**
 * Constant FORMATS
 *
 * @description
 * Formatters of a locale, built once per locale for every timeline of the page.
 *
 * @type {(locale: string) => TimelineFormats}
 */
const FORMATS: (locale: string) => TimelineFormats = ɵperLocale(
  (locale: string): TimelineFormats => {
    const dayMonth: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
    });
    const order: string[] = dayMonth.formatToParts(new Date(2026, 10, 18)).map((part) => part.type);
    return {
      day: new Intl.DateTimeFormat(locale, { day: 'numeric' }),
      dayMonth,
      month: new Intl.DateTimeFormat(locale, { month: 'short' }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      dayFirst: order.indexOf('day') < order.indexOf('month'),
    };
  },
);

/**
 * Function sameMonth
 *
 * @description
 * Checks whether two days belong to the same month of the same year.
 *
 * @param {Date} start - First day.
 * @param {Date} end - Second day.
 *
 * @returns {boolean} Whether both days share their month and year.
 */
function sameMonth(start: Date, end: Date): boolean {
  return start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
}

/**
 * Function startText
 *
 * @description
 * The first day of a range: its day alone when the range stays in one month and the locale writes
 * the day first (« 12 » of « 12 – 14 nov. »), else its day and month.
 *
 * @param {Date} start - First day of the range.
 * @param {Date} end - Last day of the range.
 * @param {string} locale - BCP 47 language tag of the dates.
 *
 * @returns {string} Text of the first day.
 */
function startText(start: Date, end: Date, locale: string): string {
  const formats: TimelineFormats = FORMATS(locale);
  return sameMonth(start, end) && formats.dayFirst
    ? formats.day.format(start)
    : formats.dayMonth.format(start);
}

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
 * Formats a day and abbreviated month in a locale.
 *
 * @param {Date} date - Date to format.
 * @param {string} locale - BCP 47 language tag of the date.
 *
 * @returns {string} Day and abbreviated month, « 12 nov. » in French.
 */
export function dayMonth(date: Date, locale: string): string {
  return FORMATS(locale).dayMonth.format(date);
}

/**
 * Function monthShort
 *
 * @description
 * Formats an abbreviated month in a locale.
 *
 * @param {Date} date - Date to format.
 * @param {string} locale - BCP 47 language tag of the month.
 *
 * @returns {string} Abbreviated month, « nov. » in French.
 */
export function monthShort(date: Date, locale: string): string {
  return FORMATS(locale).month.format(date);
}

/**
 * Function weekdayShort
 *
 * @description
 * Returns the two-letter weekday used on the ruler.
 *
 * @param {Date} date - Date to format.
 * @param {string} locale - BCP 47 language tag of the weekday.
 *
 * @returns {string} Two-letter weekday, « je » in French, « Th » in English.
 */
export function weekdayShort(date: Date, locale: string): string {
  return FORMATS(locale).weekday.format(date).slice(0, 2);
}

/**
 * Function periodText
 *
 * @description
 * Formats a date period in a locale, including both months when they differ.
 *
 * @param {Date} start - First day of the period.
 * @param {Date} end - Last day of the period.
 * @param {string} locale - BCP 47 language tag of the dates.
 *
 * @returns {string} Period text, « 12 – 14 nov. » in French.
 */
export function periodText(start: Date, end: Date, locale: string): string {
  if (ɵsameDay(start, end)) return dayMonth(start, locale);
  return `${startText(start, end, locale)} – ${dayMonth(end, locale)}`;
}

/**
 * Function rangeText
 *
 * @description
 * Formats a date range or a single day for the announcements, dates in a locale. The words
 * (« le », « du », « au ») stay French: they are texts, not formats.
 *
 * @param {Date} start - First day of the range.
 * @param {Date} end - Last day of the range.
 * @param {string} locale - BCP 47 language tag of the dates.
 *
 * @returns {string} Date range or single-day text, « du 12 au 14 nov. » in French.
 */
export function rangeText(start: Date, end: Date, locale: string): string {
  if (ɵsameDay(start, end)) return `le ${dayMonth(start, locale)}`;
  return `du ${startText(start, end, locale)} au ${dayMonth(end, locale)}`;
}

/**
 * Function moveText
 *
 * @description
 * Formats the date range and inclusive day count for a moving bar, dates in a locale. The day
 * unit (« j ») stays French: it is a text, not a format.
 *
 * @param {Date} start - First day of the moved bar.
 * @param {Date} end - Last day of the moved bar.
 * @param {string} locale - BCP 47 language tag of the dates.
 *
 * @returns {string} Date range and inclusive day count, « 12 → 14 nov. · 3 j » in French.
 */
export function moveText(start: Date, end: Date, locale: string): string {
  const from: string = startText(start, end, locale);
  return `${from} → ${dayMonth(end, locale)} · ${String(ɵdaysBetween(start, end) + 1)} j`;
}
