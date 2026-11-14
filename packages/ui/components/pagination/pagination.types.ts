/**
 * Type CwPaginationVariant
 *
 * @description
 * Layout of a pagination: numbered pages (`full`) or « Précédent · Page 3 sur 12 · Suivant ».
 *
 * @type {'full' | 'simple'}
 */
export type CwPaginationVariant = 'full' | 'simple';

/**
 * Type CwPaginationSize
 *
 * @description
 * Height of the buttons: 32 px under a table, 28 px in panels, cards and sheets.
 *
 * @type {'default' | 'sm'}
 */
export type CwPaginationSize = 'default' | 'sm';

/**
 * Interface CwPaginationLabels
 *
 * @description
 * The texts of a pagination, French by default (Pagination sheet of the Design System artifact).
 */
export interface CwPaginationLabels {
  // #region Properties
  /**
   * Property first
   * @readonly
   *
   * @description
   * Name of the button to the first page.
   *
   * @type {string}
   */
  readonly first: string;

  /**
   * Property previous
   * @readonly
   *
   * @description
   * Name of the icon-only button to the previous page (the table bar).
   *
   * @type {string}
   */
  readonly previous: string;

  /**
   * Property previousText
   * @readonly
   *
   * @description
   * Text, and name, of the labelled previous button.
   *
   * @type {string}
   */
  readonly previousText: string;

  /**
   * Property next
   * @readonly
   *
   * @description
   * Name of the icon-only button to the next page (the table bar).
   *
   * @type {string}
   */
  readonly next: string;

  /**
   * Property nextText
   * @readonly
   *
   * @description
   * Text, and name, of the labelled next button.
   *
   * @type {string}
   */
  readonly nextText: string;

  /**
   * Property last
   * @readonly
   *
   * @description
   * Name of the button to the last page.
   *
   * @type {string}
   */
  readonly last: string;

  /**
   * Property page
   * @readonly
   *
   * @description
   * Word before a page number: « Page 6 », « Page 3 sur 12 ».
   *
   * @type {string}
   */
  readonly page: string;

  /**
   * Property of
   * @readonly
   *
   * @description
   * Word between a position and a total: « Page 3 sur 12 », « 51–75 sur 286 ».
   *
   * @type {string}
   */
  readonly of: string;

  /**
   * Property hiddenPages
   * @readonly
   *
   * @description
   * Hidden text of an ellipsis.
   *
   * @type {string}
   */
  readonly hiddenPages: string;

  /**
   * Property pageSize
   * @readonly
   *
   * @description
   * Label of the page size select.
   *
   * @type {string}
   */
  readonly pageSize: string;
  // #endregion
}
