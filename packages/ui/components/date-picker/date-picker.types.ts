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
