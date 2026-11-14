/**
 * Type CwCalendarViewMode
 *
 * @description
 * The month grid (six weeks) or the week with its hourly slots.
 *
 * @type {'month' | 'week'}
 */
export type CwCalendarViewMode = 'month' | 'week';

/**
 * Type CwCalendarWeekStart
 *
 * @description
 * First day of the week: 1 for Monday (the French week), 0 for Sunday.
 *
 * @type {0 | 1}
 */
export type CwCalendarWeekStart = 0 | 1;

/**
 * Type CwCalendarSlotMinutes
 *
 * @description
 * Step of the slots of the week view, for dropping and creating.
 *
 * @type {15 | 30 | 60}
 */
export type CwCalendarSlotMinutes = 15 | 30 | 60;

/**
 * Interface CwCalendarSpan
 *
 * @description
 * When an item happens. `allDay` items cover the days from `start` to `end` (the same day for one day; several days draw a bar across the week); timed items run from `start` to `end` on the day of `start` and sit in the slots of the week view.
 */
export interface CwCalendarSpan {
  // #region Properties
  /**
   * Property start
   *
   * @description
   * Start date and time of the item.
   *
   * @type {Date}
   * @readonly
   */
  readonly start: Date;

  /**
   * Property end
   *
   * @description
   * End date and time of the item.
   *
   * @type {Date}
   * @readonly
   */
  readonly end: Date;

  /**
   * Property allDay
   *
   * @description
   * Whether the item occupies whole days.
   *
   * @type {boolean}
   * @readonly
   */
  readonly allDay: boolean;
  // #endregion
}

/**
 * Type CwCalendarKeyFn
 *
 * @description
 * Reads a key of an item: its id (`trackBy`) or its name (`itemLabel`).
 *
 * @type {(item: T) => string}
 */
export type CwCalendarKeyFn<T> = (item: T) => string;

/**
 * Type CwCalendarSpanFn
 *
 * @description
 * Reads when an item happens; `null` leaves it out (no date: « Sans date »).
 *
 * @type {(item: T) => CwCalendarSpan | null}
 */
export type CwCalendarSpanFn<T> = (item: T) => CwCalendarSpan | null;

/**
 * Interface CwCalendarItemMove
 *
 * @description
 * An item dropped on another day or slot, with the mouse or the keyboard; its duration is kept. The calendar shows it at once; the parent persists it and gives the updated `items`, or gives the old ones back to undo it.
 */
export interface CwCalendarItemMove<T> {
  // #region Properties
  /**
   * Property item
   *
   * @description
   * Item being moved or rendered.
   *
   * @type {T}
   * @readonly
   */
  readonly item: T;

  /**
   * Property start
   *
   * @description
   * Start date and time of the item.
   *
   * @type {Date}
   * @readonly
   */
  readonly start: Date;

  /**
   * Property end
   *
   * @description
   * End date and time of the item.
   *
   * @type {Date}
   * @readonly
   */
  readonly end: Date;

  /**
   * Property allDay
   *
   * @description
   * Whether the item occupies whole days.
   *
   * @type {boolean}
   * @readonly
   */
  readonly allDay: boolean;
  // #endregion
}

/**
 * Interface CwCalendarCreate
 *
 * @description
 * A request to create an item: on a day (`allDay`) or at the time of a week slot.
 */
export interface CwCalendarCreate {
  // #region Properties
  /**
   * Property date
   *
   * @description
   * Selected date.
   *
   * @type {Date}
   * @readonly
   */
  readonly date: Date;

  /**
   * Property allDay
   *
   * @description
   * Whether the item occupies whole days.
   *
   * @type {boolean}
   * @readonly
   */
  readonly allDay: boolean;
  // #endregion
}

/**
 * Type CwCalendarItemPlace
 *
 * @description
 * Where an item template is drawn: a pill of the month grid, a bar across days, a block or an all-day pill of the week view, or a row of the day popover.
 *
 * @type {'month' | 'bar' | 'week' | 'list'}
 */
export type CwCalendarItemPlace = 'month' | 'bar' | 'week' | 'list';

/**
 * Interface CwCalendarItemContext
 *
 * @description
 * What an item template receives: the item, where it is drawn and when it happens.
 */
export interface CwCalendarItemContext<T> {
  // #region Properties
  /**
   * Property $implicit
   *
   * @description
   * Item supplied to the template.
   *
   * @type {T}
   * @readonly
   */
  readonly $implicit: T;

  /**
   * Property view
   *
   * @description
   * Location where the item is rendered.
   *
   * @type {CwCalendarItemPlace}
   * @readonly
   */
  readonly view: CwCalendarItemPlace;

  /**
   * Property span
   *
   * @description
   * Dates and all-day state of the item.
   *
   * @type {CwCalendarSpan}
   * @readonly
   */
  readonly span: CwCalendarSpan;
  // #endregion
}

/**
 * Interface CwCalendarViewLabels
 *
 * @description
 * The texts of the calendar view, French by default (Calendar View sheet of the Design System artifact). The braces are replaced: `{count}`, `{date}`, `{from}`, `{to}`, `{item}`.
 */
export interface CwCalendarViewLabels {
  // #region Properties
  /**
   * Property today
   *
   * @description
   * Label for returning to today.
   *
   * @type {string}
   * @readonly
   */
  readonly today: string;

  /**
   * Property previousMonth
   *
   * @description
   * Label for the previous month.
   *
   * @type {string}
   * @readonly
   */
  readonly previousMonth: string;

  /**
   * Property nextMonth
   *
   * @description
   * Label for the next month.
   *
   * @type {string}
   * @readonly
   */
  readonly nextMonth: string;

  /**
   * Property previousWeek
   *
   * @description
   * Label for the previous week.
   *
   * @type {string}
   * @readonly
   */
  readonly previousWeek: string;

  /**
   * Property nextWeek
   *
   * @description
   * Label for the next week.
   *
   * @type {string}
   * @readonly
   */
  readonly nextWeek: string;

  /**
   * Property views
   *
   * @description
   * Accessible name of the view selector.
   *
   * @type {string}
   * @readonly
   */
  readonly views: string;

  /**
   * Property month
   *
   * @description
   * Label for month view.
   *
   * @type {string}
   * @readonly
   */
  readonly month: string;

  /**
   * Property week
   *
   * @description
   * Label for week view.
   *
   * @type {string}
   * @readonly
   */
  readonly week: string;

  /**
   * Property unscheduled
   *
   * @description
   * Label for unscheduled items.
   *
   * @type {string}
   * @readonly
   */
  readonly unscheduled: string;

  /**
   * Property allDay
   *
   * @description
   * Label for the all-day row.
   *
   * @type {string}
   * @readonly
   */
  readonly allDay: string;

  /**
   * Property hour
   *
   * @description
   * Header of the hour gutter, read only.
   *
   * @type {string}
   * @readonly
   */
  readonly hour: string;

  /**
   * Property moreOne
   *
   * @description
   * « +1 autre ».
   *
   * @type {string}
   * @readonly
   */
  readonly moreOne: string;

  /**
   * Property moreOther
   *
   * @description
   * « +3 autres ».
   *
   * @type {string}
   * @readonly
   */
  readonly moreOther: string;

  /**
   * Property countOne
   *
   * @description
   * Count of a day's items, after its name: « 1 tâche ».
   *
   * @type {string}
   * @readonly
   */
  readonly countOne: string;

  /**
   * Property countOther
   *
   * @description
   * « 4 tâches ».
   *
   * @type {string}
   * @readonly
   */
  readonly countOther: string;

  /**
   * Property createOn
   *
   * @description
   * Name of the « + » of a day: « Créer une tâche le 3 novembre ».
   *
   * @type {string}
   * @readonly
   */
  readonly createOn: string;

  /**
   * Property addOn
   *
   * @description
   * Last row of the day popover: « Ajouter une tâche le 12 nov. ».
   *
   * @type {string}
   * @readonly
   */
  readonly addOn: string;

  /**
   * Property close
   *
   * @description
   * Label for closing the day popover.
   *
   * @type {string}
   * @readonly
   */
  readonly close: string;

  /**
   * Property weekGrid
   *
   * @description
   * Name of the week grid: « Semaine du 9 au 15 novembre 2026 ».
   *
   * @type {string}
   * @readonly
   */
  readonly weekGrid: string;

  /**
   * Property range
   *
   * @description
   * Title of a bar across days: « Maquetter la vue Calendrier, du 16 au 18 nov. ».
   *
   * @type {string}
   * @readonly
   */
  readonly range: string;

  /**
   * Property grabbed
   *
   * @description
   * Announced when an item is grabbed with Space.
   *
   * @type {string}
   * @readonly
   */
  readonly grabbed: string;

  /**
   * Property moved
   *
   * @description
   * Announced when an item is dropped: « … déplacée au mardi 24 novembre ».
   *
   * @type {string}
   * @readonly
   */
  readonly moved: string;

  /**
   * Property cancelled
   *
   * @description
   * Announced when Escape cancels the move.
   *
   * @type {string}
   * @readonly
   */
  readonly cancelled: string;
  // #endregion
}
