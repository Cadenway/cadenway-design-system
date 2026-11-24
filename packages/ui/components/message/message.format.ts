/*
 * Message times in the provided locale, internal to the entry point. Mockup `App.dc.html`:
 * « à l'instant », « il y a 2 h », « hier »; Message sheet: « 10:42 », « hier 17:20 ».
 */

import { ɵperLocale, ɵsameDay } from '@cadenway/ui/core';

/**
 * Constant MINUTE
 *
 * @description
 * Duration of a minute in milliseconds.
 *
 * @type {number}
 */
const MINUTE: number = 60_000;

/**
 * Constant HOUR
 *
 * @description
 * Duration of an hour in milliseconds.
 *
 * @type {number}
 */
const HOUR: number = 60 * MINUTE;

/**
 * Interface MessageFormats
 *
 * @description
 * The `Intl` formatters of the message times in one locale.
 */
interface MessageFormats {
  // #region Properties
  /**
   * Property clock
   *
   * @description
   * Hours and minutes (« 10:42 » in French).
   *
   * @type {Intl.DateTimeFormat}
   * @readonly
   */
  readonly clock: Intl.DateTimeFormat;

  /**
   * Property day
   *
   * @description
   * Day and abbreviated month (« 12 nov. » in French).
   *
   * @type {Intl.DateTimeFormat}
   * @readonly
   */
  readonly day: Intl.DateTimeFormat;

  /**
   * Property dayYear
   *
   * @description
   * Day, abbreviated month and year, for a message of another year.
   *
   * @type {Intl.DateTimeFormat}
   * @readonly
   */
  readonly dayYear: Intl.DateTimeFormat;

  /**
   * Property relative
   *
   * @description
   * Short relative time for recent minutes (« il y a 5 min » in French).
   *
   * @type {Intl.RelativeTimeFormat}
   * @readonly
   */
  readonly relative: Intl.RelativeTimeFormat;

  /**
   * Property relativeDay
   *
   * @description
   * Relative time with calendar words (« hier » in French).
   *
   * @type {Intl.RelativeTimeFormat}
   * @readonly
   */
  readonly relativeDay: Intl.RelativeTimeFormat;
  // #endregion
}

/**
 * Constant FORMATS
 *
 * @description
 * Formatters of a locale, built once per locale for every message of the page.
 *
 * @type {(locale: string) => MessageFormats}
 */
const FORMATS: (locale: string) => MessageFormats = ɵperLocale(
  (locale: string): MessageFormats => ({
    clock: new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }),
    day: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }),
    dayYear: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }),
    relative: new Intl.RelativeTimeFormat(locale, { style: 'short' }),
    relativeDay: new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }),
  }),
);

/**
 * Function clockTime
 *
 * @description
 * Formats the local hour and minute for a message.
 *
 * @param {Date} time - Message timestamp to format.
 * @param {string} locale - BCP 47 language tag of the time.
 *
 * @returns {string} Local time, for example « 10:42 » in French.
 */
export function clockTime(time: Date, locale: string): string {
  return FORMATS(locale).clock.format(time);
}

/**
 * Function messageTime
 *
 * @description
 * The time shown in a message header: `justNow` under a minute, « il y a 5 min » under an hour,
 * « 10:42 » the same day, « hier 17:20 » the day before, « 12 nov. 10:42 » before that (with the
 * year when it differs); the words and formats are those of `locale`.
 *
 * @param {Date} time - Timestamp of the message.
 * @param {Date} now - Reference time used to determine the relative or calendar display.
 * @param {string} justNow - Text shown for a non-future timestamp less than one minute old.
 * @param {string} locale - BCP 47 language tag of the relative and calendar times.
 *
 * @returns {string} Relative or calendar time for the message header.
 */
export function messageTime(time: Date, now: Date, justNow: string, locale: string): string {
  const formats: MessageFormats = FORMATS(locale);
  const elapsed: number = now.getTime() - time.getTime();
  if (elapsed >= 0 && elapsed < MINUTE) return justNow;
  if (elapsed >= 0 && elapsed < HOUR) {
    return formats.relative.format(-Math.floor(elapsed / MINUTE), 'minute');
  }
  const clock: string = formats.clock.format(time);
  if (ɵsameDay(time, now)) return clock;
  const yesterday: Date = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (ɵsameDay(time, yesterday)) return `${formats.relativeDay.format(-1, 'day')} ${clock}`;
  const day: Intl.DateTimeFormat =
    time.getFullYear() === now.getFullYear() ? formats.day : formats.dayYear;
  return `${day.format(time)} ${clock}`;
}
