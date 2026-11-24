/**
 * Interface CwDatePickerRange
 *
 * @description
 * Complete period selected in a range date picker.
 */
export interface CwDatePickerRange {
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
   * Last day of the selected period.
   *
   * @type {Date}
   * @readonly
   */
  readonly end: Date;
  // #endregion
}

/**
 * Type CwDatePickerValue
 *
 * @description
 * Selected day, complete period or null when no date is selected.
 *
 * @type {Date | CwDatePickerRange | null}
 */
export type CwDatePickerValue = Date | CwDatePickerRange | null;

/**
 * Type CwDatePickerVariant
 *
 * @description
 * Uses a button trigger or a field for typing a date.
 *
 * @type {'button' | 'input'}
 */
export type CwDatePickerVariant = 'button' | 'input';

/**
 * Type CwDatePickerSize
 *
 * @description
 * Trigger height: 28 pixels for sm, 32 by default and 36 for lg.
 *
 * @type {'sm' | 'default' | 'lg'}
 */
export type CwDatePickerSize = 'sm' | 'default' | 'lg';

/**
 * Interface CwDatePreset
 *
 * @description
 * Shortcut computed by the consumer; a null date clears the selection.
 */
export interface CwDatePreset {
  // #region Properties
  /**
   * Property label
   *
   * @description
   * Text displayed for the shortcut.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property date
   *
   * @description
   * Date selected by the shortcut, or null to clear the value.
   *
   * @type {Date | null}
   * @readonly
   */
  readonly date: Date | null;
  // #endregion
}

/**
 * Interface CwDatePickerLabels
 *
 * @description
 * Text defaults replaceable for an application or subtree with `provideCwDatePickerLabels`.
 */
export interface CwDatePickerLabels {
  // #region Properties
  /**
   * Property placeholder
   *
   * @description
   * Placeholder shown when no date is selected.
   *
   * @type {string}
   * @readonly
   */
  readonly placeholder: string;

  /**
   * Property dialog
   *
   * @description
   * Accessible name of the calendar dialog.
   *
   * @type {string}
   * @readonly
   */
  readonly dialog: string;

  /**
   * Property clear
   *
   * @description
   * Text of the clear button.
   *
   * @type {string}
   * @readonly
   */
  readonly clear: string;

  /**
   * Property addTime
   *
   * @description
   * Text of the button that reveals the time field.
   *
   * @type {string}
   * @readonly
   */
  readonly addTime: string;

  /**
   * Property time
   *
   * @description
   * Accessible name of the time field.
   *
   * @type {string}
   * @readonly
   */
  readonly time: string;

  /**
   * Property openCalendar
   *
   * @description
   * Accessible name of the calendar button.
   *
   * @type {string}
   * @readonly
   */
  readonly openCalendar: string;

  /**
   * Property inputPlaceholder
   *
   * @description
   * Placeholder and date format hint for the typed date field.
   *
   * @type {string}
   * @readonly
   */
  readonly inputPlaceholder: string;
  // #endregion
}
