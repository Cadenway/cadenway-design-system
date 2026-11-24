/**
 * Type CwPropertyListOrientation
 *
 * @description
 * Layout of a property list as label and value columns or chips.
 *
 * @type {'vertical' | 'inline'}
 */
export type CwPropertyListOrientation = 'vertical' | 'inline';

/**
 * Interface CwPropertyListLabels
 *
 * @description
 * Default texts replaced for an application or subtree with `provideCwPropertyListLabels`.
 */
export interface CwPropertyListLabels {
  // #region Properties
  /**
   * Property emptyFieldsLabel
   *
   * @description
   * Default text for the `emptyFieldsLabel` input.
   *
   * @type {string}
   * @readonly
   */
  readonly emptyFieldsLabel: string;

  /**
   * Property addFieldLabel
   *
   * @description
   * Default text for the `addFieldLabel` input.
   *
   * @type {string}
   * @readonly
   */
  readonly addFieldLabel: string;

  /**
   * Property emptyText
   *
   * @description
   * Default text for the `emptyText` input.
   *
   * @type {string}
   * @readonly
   */
  readonly emptyText: string;

  /**
   * Property readonlyLabel
   *
   * @description
   * Default text for the `readonlyLabel` input.
   *
   * @type {string}
   * @readonly
   */
  readonly readonlyLabel: string;
  // #endregion
}
