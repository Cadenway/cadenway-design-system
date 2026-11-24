/**
 * Type CwCalendarMode
 *
 * @description
 * Selection mode for a single day or a range of days.
 *
 * @type {'single' | 'range'}
 */
export type CwCalendarMode = 'single' | 'range';

/**
 * Interface CwDateRange
 *
 * @description
 * Selected period; the second pick closes the range and an earlier day becomes the start.
 */
export interface CwDateRange {
  // #region Properties
  /**
   * Property start
   *
   * @description
   * First day of the selected period.
   *
   * @type {Date}
   * @readonly
   */
  readonly start: Date;

  /**
   * Property end
   *
   * @description
   * Last day of the period, or null while only its start is selected.
   *
   * @type {Date | null}
   * @readonly
   */
  readonly end: Date | null;
  // #endregion
}

/**
 * Type CwCalendarSelection
 *
 * @description
 * Selected day, selected range or null when nothing is selected.
 *
 * @type {Date | CwDateRange | null}
 */
export type CwCalendarSelection = Date | CwDateRange | null;

/**
 * Type CwCalendarCaptionLayout
 *
 * @description
 * Displays a month title or month and year dropdowns for distant dates.
 *
 * @type {'label' | 'dropdown'}
 */
export type CwCalendarCaptionLayout = 'label' | 'dropdown';

/**
 * Type CwWeekStart
 *
 * @description
 * First day of the week: zero for Sunday or one for Monday.
 *
 * @type {0 | 1}
 */
export type CwWeekStart = 0 | 1;

/**
 * Type CwDateDisabledFn
 *
 * @description
 * Determines whether a day cannot be selected and should be shown struck through.
 *
 * @type {(date: Date) => boolean}
 */
export type CwDateDisabledFn = (date: Date) => boolean;

/**
 * Interface CwCalendarLabels
 *
 * @description
 * Texts used by Calendar instances.
 */
export interface CwCalendarLabels {
  // #region Properties
  /**
   * Property previousMonth
   *
   * @description
   * Previous month button accessible name.
   *
   * @type {string}
   */
  previousMonth: string;

  /**
   * Property nextMonth
   *
   * @description
   * Next month button accessible name.
   *
   * @type {string}
   */
  nextMonth: string;

  /**
   * Property monthList
   *
   * @description
   * Month selector accessible name.
   *
   * @type {string}
   */
  monthList: string;

  /**
   * Property yearList
   *
   * @description
   * Year selector accessible name.
   *
   * @type {string}
   */
  yearList: string;

  /**
   * Property week
   *
   * @description
   * Week number accessible name.
   *
   * @type {string}
   */
  week: string;

  /**
   * Property weekShort
   *
   * @description
   * Abbreviated week heading.
   *
   * @type {string}
   */
  weekShort: string;
  // #endregion
}
