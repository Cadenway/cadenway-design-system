/*
 * Message times, internal to the entry point. Mockup `App.dc.html`: « à l'instant », « il y a 2 h »,
 * « hier »; Message sheet: « 10:42 », « hier 17:20 ».
 */

import { ɵsameDay } from '@cadenway/ui/core';

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
 * Constant CLOCK
 *
 * @description
 * French formatter for hours and minutes.
 *
 * @type {Intl.DateTimeFormat}
 */
const CLOCK: Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * Constant DAY
 *
 * @description
 * French formatter for a day and abbreviated month.
 *
 * @type {Intl.DateTimeFormat}
 */
const DAY: Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
});

/**
 * Constant DAY_YEAR
 *
 * @description
 * French formatter for a day, abbreviated month and year.
 *
 * @type {Intl.DateTimeFormat}
 */
const DAY_YEAR: Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
/**
 * Constant RELATIVE
 *
 * @description
 * French short relative-time formatter for recent minutes.
 *
 * @type {Intl.RelativeTimeFormat}
 */
const RELATIVE: Intl.RelativeTimeFormat = new Intl.RelativeTimeFormat('fr', { style: 'short' });

/**
 * Constant RELATIVE_DAY
 *
 * @description
 * French relative-time formatter using calendar words such as yesterday.
 *
 * @type {Intl.RelativeTimeFormat}
 */
const RELATIVE_DAY: Intl.RelativeTimeFormat = new Intl.RelativeTimeFormat('fr', {
  numeric: 'auto',
});

/**
 * Function clockTime
 *
 * @description
 * Formats the local hour and minute for a message.
 *
 * @param {Date} time - Message timestamp to format.
 *
 * @returns {string} French local time, for example « 10:42 ».
 */
export function clockTime(time: Date): string {
  return CLOCK.format(time);
}

/**
 * Function messageTime
 *
 * @description
 * The time shown in a message header: `justNow` under a minute, « il y a 5 min » under an hour,
 * « 10:42 » the same day, « hier 17:20 » the day before, « 12 nov. 10:42 » before that (with the
 * year when it differs).
 *
 * @param {Date} time - Timestamp of the message.
 * @param {Date} now - Reference time used to determine the relative or calendar display.
 * @param {string} justNow - Text shown for a non-future timestamp less than one minute old.
 *
 * @returns {string} French relative or calendar time for the message header.
 */
export function messageTime(time: Date, now: Date, justNow: string): string {
  const elapsed: number = now.getTime() - time.getTime();
  if (elapsed >= 0 && elapsed < MINUTE) return justNow;
  if (elapsed >= 0 && elapsed < HOUR) {
    return RELATIVE.format(-Math.floor(elapsed / MINUTE), 'minute');
  }
  if (ɵsameDay(time, now)) return clockTime(time);
  const yesterday: Date = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (ɵsameDay(time, yesterday)) return `${RELATIVE_DAY.format(-1, 'day')} ${clockTime(time)}`;
  const day: Intl.DateTimeFormat = time.getFullYear() === now.getFullYear() ? DAY : DAY_YEAR;
  return `${day.format(time)} ${clockTime(time)}`;
}
