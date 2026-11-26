/**
 * Type CwActivityEmphasis
 *
 * @description
 * How an emphasized part of a summary is drawn: `strong` (medium weight, foreground color: a name, a value) or `code` (monospace: a key).
 *
 * @type {'strong' | 'code'}
 */
export type CwActivityEmphasis = 'strong' | 'code';

/**
 * Interface CwActivityPart
 *
 * @description
 * An emphasized part of an entry's summary (« Ana », « Done »).
 */
export interface CwActivityPart {
  // #region Properties
  /**
   * Property text
   *
   * @description
   * Text of the part.
   *
   * @type {string}
   * @readonly
   */
  readonly text: string;

  /**
   * Property emphasis
   *
   * @description
   * How the part is drawn; `strong` by default.
   *
   * @type {CwActivityEmphasis | undefined}
   * @readonly
   */
  readonly emphasis?: CwActivityEmphasis;
  // #endregion
}

/**
 * Type CwActivitySegment
 *
 * @description
 * One piece of a summary: plain text, drawn muted (the verb: « changed the status to »), or an emphasized part.
 *
 * @type {string | CwActivityPart}
 */
export type CwActivitySegment = string | CwActivityPart;

/**
 * Interface CwActivityActor
 *
 * @description
 * Who did it: a person drawn with `cw-avatar` (picture or initials of `name`), or a non-person actor (a form, an automation, a Git provider) drawn with an icon.
 */
export interface CwActivityActor {
  // #region Properties
  /**
   * Property name
   *
   * @description
   * Name written first in the summary, in medium weight.
   *
   * @type {string}
   * @readonly
   */
  readonly name: string;

  /**
   * Property src
   *
   * @description
   * Picture of the person's avatar.
   *
   * @type {string | null | undefined}
   * @readonly
   */
  readonly src?: string | null;

  /**
   * Property icon
   *
   * @description
   * Name of an icon registered with `provideIcons` that replaces the avatar (`phosphorClipboardTextBold` for a public form).
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly icon?: string;
  // #endregion
}

/**
 * Interface CwActivityEntry
 *
 * @description
 * One event of the feed: who, what (a rich-text summary after the actor's name, an optional quote) and when; `data` carries the consumer's object for the templates (the task of a chip).
 */
export interface CwActivityEntry<T = unknown> {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Identity of the entry.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property at
   *
   * @description
   * When it happened: a `Date`, an ISO 8601 string or a timestamp in milliseconds.
   *
   * @type {Date | string | number}
   * @readonly
   */
  readonly at: Date | string | number;

  /**
   * Property actor
   *
   * @description
   * Who did it.
   *
   * @type {CwActivityActor}
   * @readonly
   */
  readonly actor: CwActivityActor;

  /**
   * Property summary
   *
   * @description
   * What happened, after the actor's name: plain text drawn muted, emphasized parts drawn strong or as code.
   *
   * @type {readonly CwActivitySegment[]}
   * @readonly
   */
  readonly summary: readonly CwActivitySegment[];

  /**
   * Property quote
   *
   * @description
   * Quoted text under the summary (a comment excerpt), cut after two lines.
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly quote?: string;

  /**
   * Property data
   *
   * @description
   * The consumer's object, given to the `cwActivityDetail` and `cwActivitySummary` templates.
   *
   * @type {T | undefined}
   * @readonly
   */
  readonly data?: T;
  // #endregion
}

/**
 * Interface CwActivityEntryContext
 *
 * @description
 * Context of the `ng-template[cwActivityDetail]` and `ng-template[cwActivitySummary]` templates: `let-entry` (the implicit value) and `let-data="data"`.
 */
export interface CwActivityEntryContext<T> {
  // #region Properties
  /**
   * Property $implicit
   *
   * @description
   * The entry.
   *
   * @type {CwActivityEntry<T>}
   * @readonly
   */
  readonly $implicit: CwActivityEntry<T>;

  /**
   * Property entry
   *
   * @description
   * The entry, under a name.
   *
   * @type {CwActivityEntry<T>}
   * @readonly
   */
  readonly entry: CwActivityEntry<T>;

  /**
   * Property data
   *
   * @description
   * The entry's `data`.
   *
   * @type {T | undefined}
   * @readonly
   */
  readonly data: T | undefined;
  // #endregion
}

/**
 * Interface CwActivityFeedLabels
 *
 * @description
 * Texts of `cw-activity-feed`, replaced with `provideCwActivityFeedLabels` or the `labels` input.
 */
export interface CwActivityFeedLabels {
  // #region Properties
  /**
   * Property today
   *
   * @description
   * Heading of today's group.
   *
   * @type {string}
   * @readonly
   */
  readonly today: string;

  /**
   * Property yesterday
   *
   * @description
   * Heading of yesterday's group.
   *
   * @type {string}
   * @readonly
   */
  readonly yesterday: string;

  /**
   * Property count
   *
   * @description
   * Count written after a group heading (« · 3 »).
   *
   * @type {(count: number) => string}
   * @readonly
   */
  readonly count: (count: number) => string;

  /**
   * Property emptyText
   *
   * @description
   * Title of the empty state.
   *
   * @type {string}
   * @readonly
   */
  readonly emptyText: string;

  /**
   * Property loading
   *
   * @description
   * Accessible name of the loading state.
   *
   * @type {string}
   * @readonly
   */
  readonly loading: string;
  // #endregion
}
