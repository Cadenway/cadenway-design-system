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
   * Stable identifier of the rule, used to track its line; unique among the meter's rules.
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
   * Levels from the weakest to the strongest. The first one reads for an empty password or no rule
   * met, the last one only when every rule is met, the others by share of the rules met; their tone
   * follows their position (first quarter weak, up to the middle fair, above good).
   *
   * @type {readonly string[]}
   * @readonly
   */
  readonly levels: readonly string[];

  /**
   * Property met
   *
   * @description
   * Hidden text read right after a rule that the password meets; it carries its own separator
   * (« : respecté »), since nothing is inserted between the rule and this text.
   *
   * @type {string}
   * @readonly
   */
  readonly met: string;

  /**
   * Property unmet
   *
   * @description
   * Hidden text read right after a rule that the password does not meet yet; it carries its own
   * separator (« : non respecté »).
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
