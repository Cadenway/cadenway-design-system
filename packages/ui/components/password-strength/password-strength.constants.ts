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
 * its `rules` input replaces them.
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
      test: (value) => value.length >= minLength,
    },
    {
      id: 'case',
      label: labels.mixedCase,
      test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value),
    },
    { id: 'digit', label: labels.digit, test: (value) => /\d/.test(value) },
    { id: 'symbol', label: labels.symbol, test: (value) => /[^A-Za-z0-9]/.test(value) },
  ];
}

/**
 * Function strengthTone
 *
 * @description
 * Tone of a score, as a share of the rules (mockup `Inscription.dc.html`, four rules): up to a
 * quarter is weak (grenat), up to a half is fair (balise), above is good (jade). No rule is weak.
 *
 * @param {number} score - Number of rules met.
 * @param {number} total - Number of rules.
 *
 * @returns {CwPasswordStrengthTone} Tone of the score.
 */
export function strengthTone(score: number, total: number): CwPasswordStrengthTone {
  const share: number = total > 0 ? score / total : 0;
  if (share <= 0.25) return 'weak';
  return share <= 0.5 ? 'fair' : 'good';
}
