/*
 * Message times, internal to the entry point. Mockup `App.dc.html`: « à l'instant », « il y a 2 h »,
 * « hier »; Message sheet: « 10:42 », « hier 17:20 ».
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

const CLOCK = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const DAY = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const DAY_YEAR = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const RELATIVE = new Intl.RelativeTimeFormat('fr', { style: 'short' });
const RELATIVE_DAY = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

/** « 10:42 ». */
export function clockTime(time: Date): string {
  return CLOCK.format(time);
}

/** Whether two times fall on the same calendar day, in local time. */
export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * The time shown in a message header: `justNow` under a minute, « il y a 5 min » under an hour,
 * « 10:42 » the same day, « hier 17:20 » the day before, « 12 nov. 10:42 » before that (with the
 * year when it differs).
 */
export function messageTime(time: Date, now: Date, justNow: string): string {
  const elapsed = now.getTime() - time.getTime();
  if (elapsed >= 0 && elapsed < MINUTE) return justNow;
  if (elapsed >= 0 && elapsed < HOUR) {
    return RELATIVE.format(-Math.floor(elapsed / MINUTE), 'minute');
  }
  if (sameDay(time, now)) return clockTime(time);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(time, yesterday)) return `${RELATIVE_DAY.format(-1, 'day')} ${clockTime(time)}`;
  const day = time.getFullYear() === now.getFullYear() ? DAY : DAY_YEAR;
  return `${day.format(time)} ${clockTime(time)}`;
}
