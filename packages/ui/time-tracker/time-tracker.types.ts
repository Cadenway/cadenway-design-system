/** State of the timer: stopped, running (the duration moves every second), or paused. */
export type CwTimeTrackerState = 'stopped' | 'running' | 'paused';

/** The full timer with its total and estimate, or a 28 px chip (task header, List view). */
export type CwTimeTrackerVariant = 'full' | 'compact';

/** Unit of a bare number in `parseDuration`: minutes for spent time, hours for an estimate. */
export interface CwDurationParseOptions {
  readonly bareNumber?: 'minutes' | 'hours';
}

/** `formatDuration` options: `clock` writes the live `h:mm:ss` of a running timer. */
export interface CwDurationFormatOptions {
  readonly clock?: boolean;
}

/** Payload of `stop`: the session, rounded to the minute, becomes an entry. */
export interface CwTimeStopEvent {
  /** Duration of the session in milliseconds, pauses deducted. */
  readonly duration: number;
  /** When the session started. */
  readonly startedAt: Date;
}

/** The person who tracked an entry. */
export interface CwTimeEntryPerson {
  readonly name: string;
  readonly src?: string | null;
}

/** One entry of time, as `cw-time-entry-list` shows it. */
export interface CwTimeEntry {
  readonly id: string;
  readonly person: CwTimeEntryPerson;
  readonly date: Date;
  /** Duration in milliseconds (the live duration of a running entry). */
  readonly duration: number;
  readonly note?: string;
  readonly billable?: boolean;
  /** The session of a timer still running: « En cours », the duration as a clock. */
  readonly running?: boolean;
}

/** The value of `cw-time-entry-form`: what the user is about to add. */
export interface CwTimeEntryDraft {
  /** Duration in milliseconds; `null` until a readable duration is typed. */
  readonly duration: number | null;
  readonly date: Date;
  readonly note: string;
  readonly billable: boolean;
}

/** The French texts of `cw-time-tracker` (Time Tracker sheet of the Design System artifact). */
export interface CwTimeTrackerLabels {
  readonly start: string;
  readonly stop: string;
  readonly resume: string;
  readonly pause: string;
  readonly stopShort: string;
  readonly elapsed: string;
  readonly since: (time: string) => string;
  readonly paused: string;
  readonly total: string;
  readonly started: string;
  readonly saved: (duration: string) => string;
  readonly compactStart: (total: string) => string;
  readonly compactStop: (clock: string) => string;
  readonly compactResume: (clock: string) => string;
  readonly tracked: string;
  readonly estimate: string;
  readonly meterValue: (total: string, estimate: string) => string;
  readonly remaining: (duration: string) => string;
  readonly over: (duration: string) => string;
  readonly billable: string;
  readonly of: string;
  readonly addTime: string;
}

/** The French texts of `cw-time-entry-form`. */
export interface CwTimeEntryFormLabels {
  readonly title: string;
  readonly duration: string;
  readonly durationPlaceholder: string;
  readonly interpreted: (duration: string) => string;
  readonly hint: string;
  readonly invalid: string;
  readonly quick: (duration: string) => string;
  readonly date: string;
  readonly note: string;
  readonly notePlaceholder: string;
  readonly billable: string;
  readonly cancel: string;
  readonly submit: string;
}

/** The French texts of `cw-time-entry-list`. */
export interface CwTimeEntryListLabels {
  readonly list: string;
  readonly person: string;
  readonly date: string;
  readonly note: string;
  readonly billable: string;
  readonly duration: string;
  readonly running: string;
  readonly noNote: string;
  readonly empty: string;
  readonly today: string;
  readonly yesterday: string;
  readonly total: string;
  readonly edit: (person: string, date: string, duration: string) => string;
  readonly actions: (person: string) => string;
  readonly editAction: string;
  readonly duplicate: string;
  readonly remove: string;
}
