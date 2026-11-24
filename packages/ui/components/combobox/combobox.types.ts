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

/**
 * Interface CwComboboxLabels
 *
 * @description
 * Texts used by the combobox controls and their accessible descriptions.
 */
export interface CwComboboxLabels {
  // #region Properties
  /**
   * Property placeholder
   *
   * @description
   * Trigger text before a selection.
   *
   * @type {string}
   * @readonly
   */
  readonly placeholder: string;

  /**
   * Property searchPlaceholder
   *
   * @description
   * Placeholder in the search field.
   *
   * @type {string}
   * @readonly
   */
  readonly searchPlaceholder: string;

  /**
   * Property emptyText
   *
   * @description
   * Message shown when no option matches.
   *
   * @type {string}
   * @readonly
   */
  readonly emptyText: string;

  /**
   * Property createLabel
   *
   * @description
   * Formats the creation row for a query.
   *
   * @type {(query: string) => string}
   * @readonly
   */
  readonly createLabel: (query: string) => string;

  /**
   * Property loadingText
   *
   * @description
   * Message shown while searching.
   *
   * @type {string}
   * @readonly
   */
  readonly loadingText: string;

  /**
   * Property summary
   *
   * @description
   * Formats the number of selected options.
   *
   * @type {(count: number) => string}
   * @readonly
   */
  readonly summary: (count: number) => string;

  /**
   * Property resultsLabel
   *
   * @description
   * Formats the result-count announcement.
   *
   * @type {(count: number) => string}
   * @readonly
   */
  readonly resultsLabel: (count: number) => string;

  /**
   * Property disabledLabel
   *
   * @description
   * Screen-reader description of a disabled option.
   *
   * @type {string}
   * @readonly
   */
  readonly disabledLabel: string;
  // #endregion
}
