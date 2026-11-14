/**
 * Type CwTimeTrackerState
 *
 * @description
 * State of the timer: stopped, running (the duration moves every second), or paused.
 *
 * @type {'stopped' | 'running' | 'paused'}
 */
export type CwTimeTrackerState = 'stopped' | 'running' | 'paused';

/**
 * Type CwTimeTrackerVariant
 *
 * @description
 * The full timer with its total and estimate, or a 28 px chip (task header, List view).
 *
 * @type {'full' | 'compact'}
 */
export type CwTimeTrackerVariant = 'full' | 'compact';

/**
 * Interface CwDurationParseOptions
 *
 * @description
 * Unit of a bare number in `parseDuration`: minutes for spent time, hours for an estimate.
 */
export interface CwDurationParseOptions {
  // #region Properties
  /**
   * Property bareNumber
   *
   * @description
   * Unit used when the input contains a number without a unit.
   *
   * @type {'minutes' | 'hours' | undefined}
   * @readonly
   */
  readonly bareNumber?: 'minutes' | 'hours';
  // #endregion
}

/**
 * Interface CwDurationFormatOptions
 *
 * @description
 * `formatDuration` options: `clock` writes the live `h:mm:ss` of a running timer.
 */
export interface CwDurationFormatOptions {
  // #region Properties
  /**
   * Property clock
   *
   * @description
   * Whether to format the duration as a live clock.
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly clock?: boolean;
  // #endregion
}

/**
 * Interface CwTimeStopEvent
 *
 * @description
 * Payload of `stop`: the session, rounded to the minute, becomes an entry.
 */
export interface CwTimeStopEvent {
  // #region Properties
  /**
   * Property duration
   *
   * @description
   * Duration of the session in milliseconds, pauses deducted.
   *
   * @type {number}
   * @readonly
   */
  readonly duration: number;

  /**
   * Property startedAt
   *
   * @description
   * When the session started.
   *
   * @type {Date}
   * @readonly
   */
  readonly startedAt: Date;
  // #endregion
}

/**
 * Interface CwTimeEntryPerson
 *
 * @description
 * The person who tracked an entry.
 */
export interface CwTimeEntryPerson {
  // #region Properties
  /**
   * Property name
   *
   * @description
   * Display name of the person.
   *
   * @type {string}
   * @readonly
   */
  readonly name: string;

  /**
   * Property src
   *
   * @description
   * Optional avatar image source.
   *
   * @type {string | null | undefined}
   * @readonly
   */
  readonly src?: string | null;
  // #endregion
}

/**
 * Interface CwTimeEntry
 *
 * @description
 * One entry of time, as `cw-time-entry-list` shows it.
 */
export interface CwTimeEntry {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Identifier of the time entry.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property person
   *
   * @description
   * Person who recorded the entry, or its column label.
   *
   * @type {CwTimeEntryPerson}
   * @readonly
   */
  readonly person: CwTimeEntryPerson;

  /**
   * Property date
   *
   * @description
   * Date of the entry, or its field label.
   *
   * @type {Date}
   * @readonly
   */
  readonly date: Date;

  /**
   * Property duration
   *
   * @description
   * Duration in milliseconds (the live duration of a running entry).
   *
   * @type {number}
   * @readonly
   */
  readonly duration: number;

  /**
   * Property note
   *
   * @description
   * Optional note, or its field label.
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly note?: string;

  /**
   * Property billable
   *
   * @description
   * Whether time is billable, or its label.
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly billable?: boolean;

  /**
   * Property running
   *
   * @description
   * The session of a timer still running: « En cours », the duration as a clock.
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly running?: boolean;
  // #endregion
}

/**
 * Interface CwTimeEntryDraft
 *
 * @description
 * The value of `cw-time-entry-form`: what the user is about to add.
 */
export interface CwTimeEntryDraft {
  // #region Properties
  /**
   * Property duration
   *
   * @description
   * Duration in milliseconds; `null` until a readable duration is typed.
   *
   * @type {number | null}
   * @readonly
   */
  readonly duration: number | null;

  /**
   * Property date
   *
   * @description
   * Date of the entry, or its field label.
   *
   * @type {Date}
   * @readonly
   */
  readonly date: Date;

  /**
   * Property note
   *
   * @description
   * Optional note, or its field label.
   *
   * @type {string}
   * @readonly
   */
  readonly note: string;

  /**
   * Property billable
   *
   * @description
   * Whether time is billable, or its label.
   *
   * @type {boolean}
   * @readonly
   */
  readonly billable: boolean;
  // #endregion
}

/**
 * Interface CwTimeTrackerLabels
 *
 * @description
 * The French texts of `cw-time-tracker` (Time Tracker sheet of the Design System artifact).
 */
export interface CwTimeTrackerLabels {
  // #region Properties
  /**
   * Property start
   *
   * @description
   * Label for starting the timer.
   *
   * @type {string}
   * @readonly
   */
  readonly start: string;

  /**
   * Property stop
   *
   * @description
   * Label for stopping the timer.
   *
   * @type {string}
   * @readonly
   */
  readonly stop: string;

  /**
   * Property resume
   *
   * @description
   * Label for resuming the timer.
   *
   * @type {string}
   * @readonly
   */
  readonly resume: string;

  /**
   * Property pause
   *
   * @description
   * Label for pausing the timer.
   *
   * @type {string}
   * @readonly
   */
  readonly pause: string;

  /**
   * Property stopShort
   *
   * @description
   * Short label for the stop action.
   *
   * @type {string}
   * @readonly
   */
  readonly stopShort: string;

  /**
   * Property elapsed
   *
   * @description
   * Label for elapsed time.
   *
   * @type {string}
   * @readonly
   */
  readonly elapsed: string;

  /**
   * Property since
   *
   * @description
   * Formats the timer start time.
   *
   * @type {(time: string) => string}
   * @readonly
   */
  readonly since: (time: string) => string;

  /**
   * Property paused
   *
   * @description
   * Label for the paused timer.
   *
   * @type {string}
   * @readonly
   */
  readonly paused: string;

  /**
   * Property total
   *
   * @description
   * Label for the total tracked time.
   *
   * @type {string}
   * @readonly
   */
  readonly total: string;

  /**
   * Property started
   *
   * @description
   * Announcement when the timer starts.
   *
   * @type {string}
   * @readonly
   */
  readonly started: string;

  /**
   * Property saved
   *
   * @description
   * Formats the saved-duration announcement.
   *
   * @type {(duration: string) => string}
   * @readonly
   */
  readonly saved: (duration: string) => string;

  /**
   * Property compactStart
   *
   * @description
   * Formats the compact start control label.
   *
   * @type {(total: string) => string}
   * @readonly
   */
  readonly compactStart: (total: string) => string;

  /**
   * Property compactStop
   *
   * @description
   * Formats the compact stop control label.
   *
   * @type {(clock: string) => string}
   * @readonly
   */
  readonly compactStop: (clock: string) => string;

  /**
   * Property compactResume
   *
   * @description
   * Formats the compact resume control label.
   *
   * @type {(clock: string) => string}
   * @readonly
   */
  readonly compactResume: (clock: string) => string;

  /**
   * Property tracked
   *
   * @description
   * Label for tracked time.
   *
   * @type {string}
   * @readonly
   */
  readonly tracked: string;

  /**
   * Property estimate
   *
   * @description
   * Label for the time estimate.
   *
   * @type {string}
   * @readonly
   */
  readonly estimate: string;

  /**
   * Property meterValue
   *
   * @description
   * Formats the tracked and estimated values.
   *
   * @type {(total: string, estimate: string) => string}
   * @readonly
   */
  readonly meterValue: (total: string, estimate: string) => string;

  /**
   * Property remaining
   *
   * @description
   * Formats the remaining time.
   *
   * @type {(duration: string) => string}
   * @readonly
   */
  readonly remaining: (duration: string) => string;

  /**
   * Property over
   *
   * @description
   * Formats the amount over estimate.
   *
   * @type {(duration: string) => string}
   * @readonly
   */
  readonly over: (duration: string) => string;

  /**
   * Property billable
   *
   * @description
   * Whether time is billable, or its label.
   *
   * @type {string}
   * @readonly
   */
  readonly billable: string;

  /**
   * Property of
   *
   * @description
   * Text joining related totals.
   *
   * @type {string}
   * @readonly
   */
  readonly of: string;

  /**
   * Property addTime
   *
   * @description
   * Label for adding a time entry.
   *
   * @type {string}
   * @readonly
   */
  readonly addTime: string;
  // #endregion
}

/**
 * Interface CwTimeEntryFormLabels
 *
 * @description
 * The French texts of `cw-time-entry-form`.
 */
export interface CwTimeEntryFormLabels {
  // #region Properties
  /**
   * Property title
   *
   * @description
   * Heading of the entry form.
   *
   * @type {string}
   * @readonly
   */
  readonly title: string;

  /**
   * Property duration
   *
   * @description
   * Duration in milliseconds, or its field label.
   *
   * @type {string}
   * @readonly
   */
  readonly duration: string;

  /**
   * Property durationPlaceholder
   *
   * @description
   * Placeholder for the duration input.
   *
   * @type {string}
   * @readonly
   */
  readonly durationPlaceholder: string;

  /**
   * Property interpreted
   *
   * @description
   * Formats the parsed duration shown to the user.
   *
   * @type {(duration: string) => string}
   * @readonly
   */
  readonly interpreted: (duration: string) => string;

  /**
   * Property hint
   *
   * @description
   * Hint for entering a duration.
   *
   * @type {string}
   * @readonly
   */
  readonly hint: string;

  /**
   * Property invalid
   *
   * @description
   * Message for an invalid duration.
   *
   * @type {string}
   * @readonly
   */
  readonly invalid: string;

  /**
   * Property quick
   *
   * @description
   * Formats the label of a duration shortcut.
   *
   * @type {(duration: string) => string}
   * @readonly
   */
  readonly quick: (duration: string) => string;

  /**
   * Property date
   *
   * @description
   * Date of the entry, or its field label.
   *
   * @type {string}
   * @readonly
   */
  readonly date: string;

  /**
   * Property note
   *
   * @description
   * Optional note, or its field label.
   *
   * @type {string}
   * @readonly
   */
  readonly note: string;

  /**
   * Property notePlaceholder
   *
   * @description
   * Placeholder for the note input.
   *
   * @type {string}
   * @readonly
   */
  readonly notePlaceholder: string;

  /**
   * Property billable
   *
   * @description
   * Whether time is billable, or its label.
   *
   * @type {string}
   * @readonly
   */
  readonly billable: string;

  /**
   * Property cancel
   *
   * @description
   * Label for cancelling the form.
   *
   * @type {string}
   * @readonly
   */
  readonly cancel: string;

  /**
   * Property submit
   *
   * @description
   * Label for submitting the form.
   *
   * @type {string}
   * @readonly
   */
  readonly submit: string;
  // #endregion
}

/**
 * Interface CwTimeEntryListLabels
 *
 * @description
 * The French texts of `cw-time-entry-list`.
 */
export interface CwTimeEntryListLabels {
  // #region Properties
  /**
   * Property list
   *
   * @description
   * Accessible name of the entry list.
   *
   * @type {string}
   * @readonly
   */
  readonly list: string;

  /**
   * Property person
   *
   * @description
   * Person who recorded the entry, or its column label.
   *
   * @type {string}
   * @readonly
   */
  readonly person: string;

  /**
   * Property date
   *
   * @description
   * Date of the entry, or its field label.
   *
   * @type {string}
   * @readonly
   */
  readonly date: string;

  /**
   * Property note
   *
   * @description
   * Optional note, or its field label.
   *
   * @type {string}
   * @readonly
   */
  readonly note: string;

  /**
   * Property billable
   *
   * @description
   * Whether time is billable, or its label.
   *
   * @type {string}
   * @readonly
   */
  readonly billable: string;

  /**
   * Property duration
   *
   * @description
   * Duration in milliseconds, or its field label.
   *
   * @type {string}
   * @readonly
   */
  readonly duration: string;

  /**
   * Property running
   *
   * @description
   * Whether an entry is running, or its label.
   *
   * @type {string}
   * @readonly
   */
  readonly running: string;

  /**
   * Property noNote
   *
   * @description
   * Fallback text for an entry without a note.
   *
   * @type {string}
   * @readonly
   */
  readonly noNote: string;

  /**
   * Property empty
   *
   * @description
   * Message shown when there are no entries.
   *
   * @type {string}
   * @readonly
   */
  readonly empty: string;

  /**
   * Property today
   *
   * @description
   * Label for an entry dated today.
   *
   * @type {string}
   * @readonly
   */
  readonly today: string;

  /**
   * Property yesterday
   *
   * @description
   * Label for an entry dated yesterday.
   *
   * @type {string}
   * @readonly
   */
  readonly yesterday: string;

  /**
   * Property total
   *
   * @description
   * Label for the total tracked time.
   *
   * @type {string}
   * @readonly
   */
  readonly total: string;

  /**
   * Property edit
   *
   * @description
   * Formats the accessible edit button label.
   *
   * @type {(person: string, date: string, duration: string) => string}
   * @readonly
   */
  readonly edit: (person: string, date: string, duration: string) => string;

  /**
   * Property actions
   *
   * @description
   * Formats the accessible entry actions label.
   *
   * @type {(person: string) => string}
   * @readonly
   */
  readonly actions: (person: string) => string;

  /**
   * Property editAction
   *
   * @description
   * Label for editing an entry.
   *
   * @type {string}
   * @readonly
   */
  readonly editAction: string;

  /**
   * Property duplicate
   *
   * @description
   * Label for duplicating an entry.
   *
   * @type {string}
   * @readonly
   */
  readonly duplicate: string;

  /**
   * Property remove
   *
   * @description
   * Label for removing an entry.
   *
   * @type {string}
   * @readonly
   */
  readonly remove: string;
  // #endregion
}
