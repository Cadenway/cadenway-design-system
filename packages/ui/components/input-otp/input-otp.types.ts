/**
 * Type CwInputOtpCharset
 *
 * @description
 * Characters accepted by a one-time code: digits or alphanumeric characters.
 *
 * @type {'digits' | 'alphanumeric'}
 */
export type CwInputOtpCharset = 'digits' | 'alphanumeric';

/**
 * Interface CwInputOtpLabels
 *
 * @description
 * Text defaults replaceable for an application or subtree with `provideCwInputOtpLabels`.
 */
export interface CwInputOtpLabels {
  // #region Properties
  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name of the one-time code field.
   *
   * @type {string}
   * @readonly
   */
  readonly ariaLabel: string;
  // #endregion
}
