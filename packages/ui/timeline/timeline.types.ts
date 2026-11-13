import type { CwStatusKey } from '@cadenway/ui/status-icon';

/** Unit of the time axis: one column per day (36 px), per week (76 px) or per month (114 px). */
export type CwTimelineScale = 'day' | 'week' | 'month';

/** The period shown, both days included. */
export interface CwTimelineRange {
  readonly start: Date;
  readonly end: Date;
}

/** The person shown next to an item in the name column. */
export interface CwTimelineAssignee {
  readonly name: string;
  readonly src?: string | null;
}

/**
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
  readonly id: string;
  readonly name: string;
  readonly start?: Date | null;
  readonly end?: Date | null;
  readonly progress?: number;
  readonly status?: CwStatusKey;
  readonly group?: string | null;
  readonly assignee?: CwTimelineAssignee | null;
  readonly late?: boolean;
}

/**
 * A group row (a sprint, a list: the consumer decides): its label, an optional period and progress
 * for the group bar. Without a period the bar spans the dated items of the group; without a
 * progress it averages theirs.
 */
export interface CwTimelineGroup {
  readonly id: string;
  readonly label: string;
  readonly start?: Date | null;
  readonly end?: Date | null;
  readonly progress?: number;
}

/** A finish-to-start link: `to` should start after `from` ends. Item ids. */
export interface CwDependency {
  readonly from: string;
  readonly to: string;
}

/**
 * A milestone: a diamond on its day, with its own row in its group. With a `status`, the diamond
 * is the `cw-status-icon` milestone of that status.
 */
export interface CwMilestone {
  readonly id: string;
  readonly label: string;
  readonly date: Date;
  readonly group?: string | null;
  readonly status?: CwStatusKey;
}

/** Emitted at the end of a move or a resize, by the pointer or the keyboard. */
export interface CwTimelineItemChange {
  readonly item: CwTimelineItem;
  readonly start: Date;
  readonly end: Date;
  readonly previous: CwTimelineRange;
}

/** Emitted when « Planifier » gives dates to an undated item. */
export interface CwTimelineSchedule {
  readonly item: CwTimelineItem;
  readonly start: Date;
  readonly end: Date;
}

/** Emitted when a change makes a successor start before its predecessor ends. */
export interface CwTimelineConflict {
  readonly dependency: CwDependency;
  readonly overlapDays: number;
}

/** Context of a custom bar template: the item and the drawn width of its bar in pixels. */
export interface CwTimelineBarContext {
  readonly $implicit: CwTimelineItem;
  readonly width: number;
}
