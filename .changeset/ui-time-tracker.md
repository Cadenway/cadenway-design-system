---
'@cadenway/ui': minor
---

Add `@cadenway/ui/components/time-tracker`: `cw-time-tracker` (timer stopped, running and paused with `[(state)]`, a live `h:mm:ss` duration, `start`, `pause`, `resume` and `stop` rounded to the minute; the total against the estimate through `cw-meter`, the excess written « +33 min »; the billable line; a `compact` chip), `cw-time-entry-list` (entries with person, date, note, billable, duration, a running entry, totals, edit, duplicate and remove) and `cw-time-entry-form` (shortcuts « + 15 min » … « + 2 h », a duration read as typed, date, note, billable; opened from « Ajouter du temps »). `parseDuration` reads « 1 h 30 », « 1:30 », « 90 min », « 1,5 h » (a bare number in minutes, or hours for an estimate) and `formatDuration` writes « 1 h 30 », « 48 min » or `h:mm:ss`.
