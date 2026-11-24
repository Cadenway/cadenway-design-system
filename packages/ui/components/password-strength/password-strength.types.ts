/**
 * Interface CwPasswordRule
 *
 * @description
 * One requirement a new password is checked against, shown as a line of the rule list and counted
 * in the score.
 */
export interface CwPasswordRule {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable identifier of the rule, used to track its line.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property label
   *
   * @description
   * Text of the rule (« 12 caractères minimum »).
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property test
   *
   * @description
   * Whether the password meets the rule.
   *
   * @type {(value: string) => boolean}
   * @readonly
   */
  readonly test: (value: string) => boolean;
  // #endregion
}

/**
 * Interface CwPasswordStrengthLabels
 *
 * @description
 * The texts of the password strength meter, French by default (`CW_PASSWORD_STRENGTH_LABELS`, word
 * for word from the mockup `Inscription.dc.html`), replaced for an application or a subtree with
 * `provideCwPasswordStrengthLabels`.
 */
export interface CwPasswordStrengthLabels {
  // #region Properties
  /**
   * Property meter
   *
   * @description
   * Accessible name of the segmented meter.
   *
   * @type {string}
   * @readonly
   */
  readonly meter: string;

  /**
   * Property levels
   *
   * @description
   * Level shown for each score, from 0 (no rule met) to the number of rules; the last entry serves
   * any higher score.
   *
   * @type {readonly string[]}
   * @readonly
   */
  readonly levels: readonly string[];

  /**
   * Property met
   *
   * @description
   * Hidden text read after a rule that the password meets.
   *
   * @type {string}
   * @readonly
   */
  readonly met: string;

  /**
   * Property unmet
   *
   * @description
   * Hidden text read after a rule that the password does not meet yet.
   *
   * @type {string}
   * @readonly
   */
  readonly unmet: string;

  /**
   * Property minLength
   *
   * @description
   * Text of the length rule for the given minimum.
   *
   * @type {(count: number) => string}
   * @readonly
   */
  readonly minLength: (count: number) => string;

  /**
   * Property mixedCase
   *
   * @description
   * Text of the rule asking for upper and lower case letters.
   *
   * @type {string}
   * @readonly
   */
  readonly mixedCase: string;

  /**
   * Property digit
   *
   * @description
   * Text of the rule asking for a digit.
   *
   * @type {string}
   * @readonly
   */
  readonly digit: string;

  /**
   * Property symbol
   *
   * @description
   * Text of the rule asking for a symbol.
   *
   * @type {string}
   * @readonly
   */
  readonly symbol: string;
  // #endregion
}

/**
 * Type CwPasswordStrengthTone
 *
 * @description
 * Tone of a score as a share of the rules: weak up to a quarter, fair up to a half, good above.
 *
 * @type {'weak' | 'fair' | 'good'}
 */
export type CwPasswordStrengthTone = 'weak' | 'fair' | 'good';
