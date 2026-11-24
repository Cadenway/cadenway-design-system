/**
 * Type CwSpinnerSize
 *
 * @description
 * Spinner diameter, from 12 pixels for `xs` to 32 pixels for `page`.
 *
 * @type {'xs' | 'sm' | 'default' | 'lg' | 'xl' | 'page'}
 */
export type CwSpinnerSize = 'xs' | 'sm' | 'default' | 'lg' | 'xl' | 'page';

/**
 * Interface CwSpinnerLabels
 *
 * @description
 * Replaceable texts used by the spinner entry point.
 */
export interface CwSpinnerLabels {
  // #region Properties
  /**
   * Property loading
   *
   * @description
   * Accessible name of a loading state.
   *
   * @type {string}
   */
  loading: string;
  // #endregion
}
