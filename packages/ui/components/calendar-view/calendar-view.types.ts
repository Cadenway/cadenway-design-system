/** The month grid (six weeks) or the week with its hourly slots. */
export type CwCalendarViewMode = 'month' | 'week';

/** First day of the week: 1 for Monday (the French week), 0 for Sunday. */
export type CwCalendarWeekStart = 0 | 1;

/** Step of the slots of the week view, for dropping and creating. */
export type CwCalendarSlotMinutes = 15 | 30 | 60;

/**
 * When an item happens. `allDay` items cover the days from `start` to `end` (the same day for one
 * day; several days draw a bar across the week); timed items run from `start` to `end` on the day
 * of `start` and sit in the slots of the week view.
 */
export interface CwCalendarSpan {
  readonly start: Date;
  readonly end: Date;
  readonly allDay: boolean;
}

/** Reads a key of an item: its id (`trackBy`) or its name (`itemLabel`). */
export type CwCalendarKeyFn<T> = (item: T) => string;

/** Reads when an item happens; `null` leaves it out (no date: « Sans date »). */
export type CwCalendarSpanFn<T> = (item: T) => CwCalendarSpan | null;

/**
 * An item dropped on another day or slot, with the mouse or the keyboard; its duration is kept.
 * The calendar shows it at once; the parent persists it and gives the updated `items`, or gives the
 * old ones back to undo it.
 */
export interface CwCalendarItemMove<T> {
  readonly item: T;
  readonly start: Date;
  readonly end: Date;
  readonly allDay: boolean;
}

/** A request to create an item: on a day (`allDay`) or at the time of a week slot. */
export interface CwCalendarCreate {
  readonly date: Date;
  readonly allDay: boolean;
}

/**
 * Where an item template is drawn: a pill of the month grid, a bar across days, a block or an
 * all-day pill of the week view, or a row of the day popover.
 */
export type CwCalendarItemPlace = 'month' | 'bar' | 'week' | 'list';

/** What an item template receives: the item, where it is drawn and when it happens. */
export interface CwCalendarItemContext<T> {
  readonly $implicit: T;
  readonly view: CwCalendarItemPlace;
  readonly span: CwCalendarSpan;
}

/**
 * The texts of the calendar view, French by default (Calendar View sheet of the Design System
 * artifact). The braces are replaced: `{count}`, `{date}`, `{from}`, `{to}`, `{item}`.
 */
export interface CwCalendarViewLabels {
  readonly today: string;
  readonly previousMonth: string;
  readonly nextMonth: string;
  readonly previousWeek: string;
  readonly nextWeek: string;
  readonly views: string;
  readonly month: string;
  readonly week: string;
  readonly unscheduled: string;
  readonly allDay: string;
  /** Header of the hour gutter, read only. */
  readonly hour: string;
  /** « +1 autre ». */
  readonly moreOne: string;
  /** « +3 autres ». */
  readonly moreOther: string;
  /** Count of a day's items, after its name: « 1 tâche ». */
  readonly countOne: string;
  /** « 4 tâches ». */
  readonly countOther: string;
  /** Name of the « + » of a day: « Créer une tâche le 3 novembre ». */
  readonly createOn: string;
  /** Last row of the day popover: « Ajouter une tâche le 12 nov. ». */
  readonly addOn: string;
  readonly close: string;
  /** Name of the week grid: « Semaine du 9 au 15 novembre 2026 ». */
  readonly weekGrid: string;
  /** Title of a bar across days: « Maquetter la vue Calendrier, du 16 au 18 nov. ». */
  readonly range: string;
  /** Announced when an item is grabbed with Space. */
  readonly grabbed: string;
  /** Announced when an item is dropped: « … déplacée au mardi 24 novembre ». */
  readonly moved: string;
  /** Announced when Escape cancels the move. */
  readonly cancelled: string;
}
