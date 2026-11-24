/**
 * Type CwPageHeaderSize
 *
 * @description
 * Page header layout: three stacked rows by default or one 44-pixel compact row.
 *
 * @type {'default' | 'compact'}
 */
export type CwPageHeaderSize = 'default' | 'compact';

/**
 * Interface CwPageHeaderLabels
 *
 * @description
 * Text defaults replaceable for an application or subtree with `provideCwPageHeaderLabels`.
 */
export interface CwPageHeaderLabels {
  // #region Properties
  /**
   * Property favorite
   *
   * @description
   * Accessible name of the favorite toggle.
   *
   * @type {string}
   * @readonly
   */
  readonly favorite: string;
  // #endregion
}
