/**
 * Interface CwAutocompleteLabels
 *
 * @description
 * Texts used by Autocomplete instances.
 */
export interface CwAutocompleteLabels {
  // #region Properties
  /**
   * Property loading
   *
   * @description
   * Loading message.
   *
   * @type {string}
   */
  loading: string;

  /**
   * Property empty
   *
   * @description
   * Message for an unmatched query.
   *
   * @type {(query: string) => string}
   */
  empty: (query: string) => string;

  /**
   * Property aria
   *
   * @description
   * Suggestion list accessible name.
   *
   * @type {string}
   */
  aria: string;

  /**
   * Property results
   *
   * @description
   * Suggestion count announcement.
   *
   * @type {(count: number) => string}
   */
  results: (count: number) => string;
  // #endregion
}
