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
 * Type CwCalendarViewVariant
 *
 * @description
 * Look of the month grid: `default` 76 px days with flat 20 px pills; `outlined` the mockup's
 * month (`App.dc.html`, the calendar view): 96 px days, the days of the other months on
 * `bg-muted`, today's number in a filled circle, bordered `bg-card` item chips (26 px) and 24 px
 * « + » buttons. The week view is the same in both.
 *
 * @type {'default' | 'outlined'}
 */
export type CwCalendarViewVariant = 'default' | 'outlined';

/**
 * Type CwCalendarViewToolbar
 *
 * @description
 * Layout of the header: `default` puts « Aujourd'hui », the arrows and the title first, the view
 * toggle at the end; `title` puts the title first as a heading (`h2`) and groups « Aujourd'hui »
 * and the 28 px arrows at the end (mockup `App.dc.html`, the calendar view).
 *
 * @type {'default' | 'title'}
 */
export type CwCalendarViewToolbar = 'default' | 'title';

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
 * Interface CwCalendarItemSchedule
 *
 * @description
 * An item from outside the calendar (an undated task dragged from a side panel, or placed with
 * the keyboard through `scheduleWithKeyboard`) dropped on a day or a week slot. Emitted by
 * `itemSchedule`; the consumer gives the item its date.
 */
export interface CwCalendarItemSchedule {
  // #region Properties
  /**
   * Property data
   *
   * @description
   * The outside item: the `cdkDragData` of the dragged element, or the data given to
   * `scheduleWithKeyboard`.
   *
   * @type {unknown}
   * @readonly
   */
  readonly data: unknown;

  /**
   * Property date
   *
   * @description
   * The day dropped on (its start), or the time of the week slot.
   *
   * @type {Date}
   * @readonly
   */
  readonly date: Date;

  /**
   * Property allDay
   *
   * @description
   * Whether the drop was on a whole day (month day or all-day row) rather than a timed slot.
   *
   * @type {boolean}
   * @readonly
   */
  readonly allDay: boolean;
  // #endregion
}

/**
 * Interface CwCalendarDayMenuData
 *
 * @description
 * What the day menu (`dayMenu`) acts on, read back through the menu's `data()`: the day, or the
 * time of the week slot.
 */
export interface CwCalendarDayMenuData {
  // #region Properties
  /**
   * Property date
   *
   * @description
   * The day (its start), or the time of the week slot.
   *
   * @type {Date}
   * @readonly
   */
  readonly date: Date;

  /**
   * Property allDay
   *
   * @description
   * Whether the menu was opened on a whole day rather than a timed slot.
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
   * Name of the « + » of a day: « Créer une tâche le mardi 3 novembre » (the weekday, then the date).
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

  /**
   * Property loading
   *
   * @description
   * Accessible name of the loading skeleton (`loading`). Optional so that existing label objects
   * stay valid; the calendar falls back to the default.
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly loading?: string;

  /**
   * Property scheduled
   *
   * @description
   * Announced when an outside item is placed with the keyboard: `{item}`, `{date}`. Optional; the
   * calendar falls back to the default.
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly scheduled?: string;

  /**
   * Property navigation
   *
   * @description
   * Accessible name of the group of « Aujourd’hui » and the arrows, in the `title` toolbar.
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly navigation?: string;
  // #endregion
}

/**
 * Interface CwCalendarViewProvidedLabels
 *
 * @description
 * Complete default texts accepted by the provider, including dedicated input defaults.
 */
export interface CwCalendarViewProvidedLabels extends CwCalendarViewLabels {
  // #region Properties
  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name of the calendar.
   *
   * @type {string}
   * @readonly
   */
  readonly ariaLabel: string;
  // #endregion
}
