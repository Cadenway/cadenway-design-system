import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { PASSWORD_STRENGTH_LABELS } from './password-strength-labels.token';
import { CW_PASSWORD_STRENGTH_LABELS } from './password-strength.constants';
import type { CwPasswordStrengthLabels } from './password-strength.types';

/**
 * Function provideCwPasswordStrengthLabels
 *
 * @description
 * Sets the texts of every `cw-password-strength` and `cw-password-strength-level` below the
 * injector it is provided in (the application, a route or a component subtree), for example the
 * English source copy of an application translated with `$localize`. The texts are merged over
 * those of the parent injector, then over the French defaults (`CW_PASSWORD_STRENGTH_LABELS`); a
 * meter's `rules` input still replaces its rule texts. A function is called once, in an injection
 * context, when a meter first reads its texts.
 *
 * @param {Partial<CwPasswordStrengthLabels> | (() => Partial<CwPasswordStrengthLabels>)} labels -
 * Texts to replace, or a function returning them.
 *
 * @returns {Provider} Provider of the merged meter texts.
 */
export function provideCwPasswordStrengthLabels(
  labels: Partial<CwPasswordStrengthLabels> | (() => Partial<CwPasswordStrengthLabels>),
): Provider {
  return ɵprovideLabels(PASSWORD_STRENGTH_LABELS, CW_PASSWORD_STRENGTH_LABELS, labels);
}
