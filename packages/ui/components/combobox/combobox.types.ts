/**
 * Type CwComboboxSize
 *
 * @description
 * Height, padding and radius of the trigger, those of Select; the panel keeps one size.
 *
 * @type {'sm' | 'default' | 'lg'}
 */
export type CwComboboxSize = 'sm' | 'default' | 'lg';

/**
 * Type CwComboboxCompareWith
 *
 * @description
 * Tells whether two option values are the same choice (object values compared by id, say).
 *
 * @type {(a: T, b: T) => boolean}
 */
export type CwComboboxCompareWith<T> = (a: T, b: T) => boolean;

/**
 * Interface CwComboboxFilterOption
 *
 * @description
 * Option data passed to the search filter.
 */
export interface CwComboboxFilterOption<T> {
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Option value.
   *
   * @type {T}
   */
  readonly value: T;

  /**
   * Property label
   * @readonly
   *
   * @description
   * Visible option label.
   *
   * @type {string}
   */
  readonly label: string;

  /**
   * Property keywords
   * @readonly
   *
   * @description
   * Additional search terms.
   *
   * @type {readonly string[]}
   */
  readonly keywords: readonly string[];
  // #endregion
}

/**
 * Type CwComboboxFilter
 *
 * @description
 * Tells whether an option matches the typed search (never called with an empty search).
 *
 * @type {(option: CwComboboxFilterOption<T>, query: string) => boolean}
 */
export type CwComboboxFilter<T> = (option: CwComboboxFilterOption<T>, query: string) => boolean;
