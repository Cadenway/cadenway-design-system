import type { CwDurationFormatOptions, CwDurationParseOptions } from './time-tracker.types';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/**
 * Reads a typed duration and returns it in milliseconds, or `null` when the text is not a
 * duration (Time Tracker sheet of the Design System artifact; mockup `App.dc.html`, `parseDur`
 * and `parseEst`).
 *
 * Accepts « 1 h 30 », « 1h30 », « 1 h 30 min », « 1:30 », « 90 min », « 90 mn », « 1,5 h »,
 * « 2 h » and a bare number, case and spaces ignored. A bare number counts in minutes for spent
 * time (« 45 » is 45 min), in hours with `{ bareNumber: 'hours' }` for an estimate (« 3 » or
 * « 2,5 » are hours). An empty text is `null`.
 */
export function parseDuration(text: string, options: CwDurationParseOptions = {}): number | null {
  const compact = text.toLowerCase().replace(/,/g, '.').replace(/\s+/g, '');
  if (compact === '') return null;
  if (/^\d+(?:\.\d+)?$/.test(compact)) {
    const amount = Number.parseFloat(compact);
    if (options.bareNumber === 'hours') return Math.round(amount * 60) * MINUTE;
    return Number.isInteger(amount) ? amount * MINUTE : null;
  }
  let match = /^(\d+(?:\.\d+)?)h(?:(\d{1,2})(?:min|mn|m)?)?$/.exec(compact);
  if (match) {
    // The minutes group is optional: absent, it is `undefined` at run time.
    const [, hours = '0', minutes = '0'] = match;
    return Math.round(Number.parseFloat(hours) * 60 + Number.parseInt(minutes, 10)) * MINUTE;
  }
  match = /^(\d+)(?:min|mn|m)$/.exec(compact);
  if (match) {
    const [, minutes = '0'] = match;
    return Number.parseInt(minutes, 10) * MINUTE;
  }
  match = /^(\d+):(\d{1,2})$/.exec(compact);
  if (match) {
    const [, hours = '0', minutes = '0'] = match;
    return Number.parseInt(hours, 10) * HOUR + Number.parseInt(minutes, 10) * MINUTE;
  }
  return null;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Writes a duration given in milliseconds the way Cadenway shows it: « 1 h 30 », « 3 h »,
 * « 1 h 05 », « 48 min » (rounded to the minute, never decimal: sheet, "Règles"), or, with
 * `{ clock: true }`, the live `h:mm:ss` of a running timer (« 0:42:10 »).
 */
export function formatDuration(
  milliseconds: number,
  options: CwDurationFormatOptions = {},
): string {
  const safe = Math.max(0, milliseconds);
  if (options.clock) {
    const seconds = Math.floor(safe / 1000);
    return `${String(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
  }
  const minutes = Math.round(safe / MINUTE);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${String(rest)} min`;
  return rest === 0 ? `${String(hours)} h` : `${String(hours)} h ${pad(rest)}`;
}
