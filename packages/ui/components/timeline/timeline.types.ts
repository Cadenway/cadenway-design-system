import type { CwStatusKey } from '@cadenway/ui/components/status-icon';

/**
 * Type CwTimelineScale
 *
 * @description
 * Unit of the time axis: one column per day, week or month.
 *
 * @type {'day' | 'week' | 'month'}
 */
export type CwTimelineScale = 'day' | 'week' | 'month';

/**
 * Interface CwTimelineRange
 *
 * @description
 * The period shown, both days included.
 */
export interface CwTimelineRange {
  // #region Properties
  /**
   * Property start
   * @readonly
   *
   * @description
   * First included day of the displayed period.
   *
   * @type {Date}
   */
  readonly start: Date;

  /**
   * Property end
   * @readonly
   *
   * @description
   * Last included day of the displayed period.
   *
   * @type {Date}
   */
  readonly end: Date;
  // #endregion
}

/**
 * Interface CwTimelineAssignee
 *
 * @description
 * The person shown next to an item in the name column.
 */
export interface CwTimelineAssignee {
  // #region Properties
  /**
   * Property name
   * @readonly
   *
   * @description
   * Name shown next to the item.
   *
   * @type {string}
   */
  readonly name: string;

  /**
   * Property src
   * @readonly
   *
   * @description
   * Optional avatar image URL.
   *
   * @type {string | null | undefined}
   */
  readonly src?: string | null;
  // #endregion
}

/**
 * Interface CwTimelineItem
 *
 * @description
 * One bar of the timeline, given by the consumer: the component knows nothing about what it plans.
 *
 * `start` and `end` are days, both included (time of day ignored); one of them alone gives a
 * one-day bar, neither makes an undated item (« Sans date », « Planifier »). `progress` (0 to 100)
 * draws the thin progress line and the percentage. `status` uses the display contract of
 * `cw-status-icon`: it draws the icon and tints the bar (En cours, Terminé, Bloqué), the other
 * statuses stay neutral. `group` is the `id` of a `CwTimelineGroup`. `late` overrides the late
 * rule (end before today with a progress under 100 %).
 */
export interface CwTimelineItem {
  // #region Properties
  /**
   * Property id
   * @readonly
   *
   * @description
   * Stable identifier of the timeline item.
   *
   * @type {string}
   */
  readonly id: string;

  /**
   * Property name
   * @readonly
   *
   * @description
   * Label displayed on the item bar.
   *
   * @type {string}
   */
  readonly name: string;

  /**
   * Property start
   * @readonly
   *
   * @description
   * Optional first day of the item.
   *
   * @type {Date | null | undefined}
   */
  readonly start?: Date | null;

  /**
   * Property end
   * @readonly
   *
   * @description
   * Optional last day of the item.
   *
   * @type {Date | null | undefined}
   */
  readonly end?: Date | null;

  /**
   * Property progress
   * @readonly
   *
   * @description
   * Optional completion percentage from zero to one hundred.
   *
   * @type {number | undefined}
   */
  readonly progress?: number;

  /**
   * Property status
   * @readonly
   *
   * @description
   * Optional status controlling the icon and bar tone.
   *
   * @type {CwStatusKey | undefined}
   */
  readonly status?: CwStatusKey;

  /**
   * Property group
   * @readonly
   *
   * @description
   * Optional identifier of the containing group.
   *
   * @type {string | null | undefined}
   */
  readonly group?: string | null;

  /**
   * Property assignee
   * @readonly
   *
   * @description
   * Optional person displayed alongside the item.
   *
   * @type {CwTimelineAssignee | null | undefined}
   */
  readonly assignee?: CwTimelineAssignee | null;

  /**
   * Property late
   * @readonly
   *
   * @description
   * Optional override for the calculated lateness.
   *
   * @type {boolean | undefined}
   */
  readonly late?: boolean;
  // #endregion
}

/**
 * Interface CwTimelineGroup
 *
 * @description
 * A group row (a sprint, a list: the consumer decides): its label, an optional period and progress
 * for the group bar. Without a period the bar spans the dated items of the group; without a
 * progress it averages theirs.
 */
export interface CwTimelineGroup {
  // #region Properties
  /**
   * Property id
   * @readonly
   *
   * @description
   * Stable identifier of the group.
   *
   * @type {string}
   */
  readonly id: string;

  /**
   * Property label
   * @readonly
   *
   * @description
   * Label displayed in the group row.
   *
   * @type {string}
   */
  readonly label: string;

  /**
   * Property start
   * @readonly
   *
   * @description
   * Optional first day of the group bar.
   *
   * @type {Date | null | undefined}
   */
  readonly start?: Date | null;

  /**
   * Property end
   * @readonly
   *
   * @description
   * Optional last day of the group bar.
   *
   * @type {Date | null | undefined}
   */
  readonly end?: Date | null;

  /**
   * Property progress
   * @readonly
   *
   * @description
   * Optional completion percentage for the group bar.
   *
   * @type {number | undefined}
   */
  readonly progress?: number;
  // #endregion
}

/**
 * Interface CwDependency
 *
 * @description
 * A finish-to-start link: `to` should start after `from` ends. Item ids.
 */
export interface CwDependency {
  // #region Properties
  /**
   * Property from
   * @readonly
   *
   * @description
   * Identifier of the predecessor item.
   *
   * @type {string}
   */
  readonly from: string;

  /**
   * Property to
   * @readonly
   *
   * @description
   * Identifier of the successor item.
   *
   * @type {string}
   */
  readonly to: string;
  // #endregion
}

/**
 * Interface CwMilestone
 *
 * @description
 * A milestone: a diamond on its day, with its own row in its group. With a `status`, the diamond
 * is the `cw-status-icon` milestone of that status.
 */
export interface CwMilestone {
  // #region Properties
  /**
   * Property id
   * @readonly
   *
   * @description
   * Stable identifier of the milestone.
   *
   * @type {string}
   */
  readonly id: string;

  /**
   * Property label
   * @readonly
   *
   * @description
   * Label displayed beside the milestone.
   *
   * @type {string}
   */
  readonly label: string;

  /**
   * Property date
   * @readonly
   *
   * @description
   * Day on which the milestone appears.
   *
   * @type {Date}
   */
  readonly date: Date;

  /**
   * Property group
   * @readonly
   *
   * @description
   * Optional identifier of the containing group.
   *
   * @type {string | null | undefined}
   */
  readonly group?: string | null;

  /**
   * Property status
   * @readonly
   *
   * @description
   * Optional status used for the milestone icon.
   *
   * @type {CwStatusKey | undefined}
   */
  readonly status?: CwStatusKey;
  // #endregion
}

/**
 * Interface CwTimelineItemChange
 *
 * @description
 * Emitted at the end of a move or a resize, by the pointer or the keyboard.
 */
export interface CwTimelineItemChange {
  // #region Properties
  /**
   * Property item
   * @readonly
   *
   * @description
   * Item moved or resized.
   *
   * @type {CwTimelineItem}
   */
  readonly item: CwTimelineItem;

  /**
   * Property start
   * @readonly
   *
   * @description
   * First day after the change.
   *
   * @type {Date}
   */
  readonly start: Date;

  /**
   * Property end
   * @readonly
   *
   * @description
   * Last day after the change.
   *
   * @type {Date}
   */
  readonly end: Date;

  /**
   * Property previous
   * @readonly
   *
   * @description
   * Date range before the change.
   *
   * @type {CwTimelineRange}
   */
  readonly previous: CwTimelineRange;
  // #endregion
}

/**
 * Interface CwTimelineSchedule
 *
 * @description
 * Emitted when « Planifier » gives dates to an undated item.
 */
export interface CwTimelineSchedule {
  // #region Properties
  /**
   * Property item
   * @readonly
   *
   * @description
   * Previously undated item.
   *
   * @type {CwTimelineItem}
   */
  readonly item: CwTimelineItem;

  /**
   * Property start
   * @readonly
   *
   * @description
   * First scheduled day.
   *
   * @type {Date}
   */
  readonly start: Date;

  /**
   * Property end
   * @readonly
   *
   * @description
   * Last scheduled day.
   *
   * @type {Date}
   */
  readonly end: Date;
  // #endregion
}

/**
 * Interface CwTimelineConflict
 *
 * @description
 * Emitted when a change makes a successor start before its predecessor ends.
 */
export interface CwTimelineConflict {
  // #region Properties
  /**
   * Property dependency
   * @readonly
   *
   * @description
   * Dependency whose dates now overlap.
   *
   * @type {CwDependency}
   */
  readonly dependency: CwDependency;

  /**
   * Property overlapDays
   * @readonly
   *
   * @description
   * Number of days of overlap.
   *
   * @type {number}
   */
  readonly overlapDays: number;
  // #endregion
}

/**
 * Interface CwTimelineBarContext
 *
 * @description
 * Context of a custom bar template: the item and the drawn width of its bar in pixels.
 */
export interface CwTimelineBarContext {
  // #region Properties
  /**
   * Property $implicit
   * @readonly
   *
   * @description
   * Item represented by the custom bar.
   *
   * @type {CwTimelineItem}
   */
  readonly $implicit: CwTimelineItem;

  /**
   * Property width
   * @readonly
   *
   * @description
   * Drawn bar width in pixels.
   *
   * @type {number}
   */
  readonly width: number;
  // #endregion
}
