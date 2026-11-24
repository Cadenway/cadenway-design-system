import type {
  CwPasswordRule,
  CwPasswordStrengthLabels,
  CwPasswordStrengthTone,
} from './password-strength.types';

/**
 * Constant CW_PASSWORD_STRENGTH_LABELS
 *
 * @description
 * The default texts of the meter, word for word from the mockup (`Inscription.dc.html`,
 * `Reinitialisation.dc.html`). `provideCwPasswordStrengthLabels` replaces them for every meter below
 * its injector.
 *
 * @type {CwPasswordStrengthLabels}
 */
export const CW_PASSWORD_STRENGTH_LABELS: CwPasswordStrengthLabels = {
  meter: 'Robustesse du mot de passe',
  levels: ['Trop court', 'Faible', 'Moyen', 'Bon', 'Excellent'],
  met: ' : respecté',
  unmet: ' : non respecté',
  minLength: (count: number): string => `${String(count)} caractères minimum`,
  mixedCase: 'Majuscules et minuscules',
  digit: 'Au moins un chiffre',
  symbol: 'Au moins un symbole',
};

/**
 * Function cwPasswordRules
 *
 * @description
 * Builds the four rules of the mockup (`Inscription.dc.html`): a minimum length, upper and lower
 * case letters, a digit and a symbol, with the given texts. `cw-password-strength` uses them unless
 * its `rules` input replaces them. The length counts code points, as the identity service's password
 * policy does, so an emoji is one character. Letters, digits and symbols are read in Unicode: « É »
 * is an upper case letter, « é » (composed or not) is a letter and never a symbol; a symbol is any
 * character that is neither a letter, a combining mark nor a number, the space included.
 *
 * @param {CwPasswordStrengthLabels} labels - Texts of the rules.
 * @param {number} minLength - Minimum number of characters.
 *
 * @returns {readonly CwPasswordRule[]} The four default rules.
 */
export function cwPasswordRules(
  labels: CwPasswordStrengthLabels,
  minLength: number,
): readonly CwPasswordRule[] {
  return [
    {
      id: 'length',
      label: labels.minLength(minLength),
      test: (value) => Array.from(value).length >= minLength,
    },
    {
      id: 'case',
      label: labels.mixedCase,
      test: (value) => /\p{Ll}/u.test(value) && /\p{Lu}/u.test(value),
    },
    { id: 'digit', label: labels.digit, test: (value) => /\p{Nd}/u.test(value) },
    { id: 'symbol', label: labels.symbol, test: (value) => /[^\p{L}\p{M}\p{N}]/u.test(value) },
  ];
}

/**
 * Function strengthTone
 *
 * @description
 * Tone of a level, by its position among the levels (mockup `Inscription.dc.html`, five levels): up
 * to a quarter is weak (grenat), up to the middle is fair (balise), above is good (jade). A single
 * level is weak.
 *
 * @param {number} index - Position of the level, from 0.
 * @param {number} last - Position of the last level.
 *
 * @returns {CwPasswordStrengthTone} Tone of the level.
 */
export function strengthTone(index: number, last: number): CwPasswordStrengthTone {
  const share: number = last > 0 ? index / last : 0;
  if (share <= 0.25) return 'weak';
  return share <= 0.5 ? 'fair' : 'good';
}
