import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_PASSWORD_STRENGTH_LABELS } from './password-strength.constants';
import type { CwPasswordStrengthLabels } from './password-strength.types';

/**
 * Constant PASSWORD_STRENGTH_LABELS
 *
 * @description
 * Texts of every password strength meter below the injector: the ones given by
 * `provideCwPasswordStrengthLabels`, over the French defaults when nothing is provided.
 *
 * @type {InjectionToken<CwPasswordStrengthLabels>}
 */
export const PASSWORD_STRENGTH_LABELS: InjectionToken<CwPasswordStrengthLabels> =
  ɵlabelsToken<CwPasswordStrengthLabels>('PASSWORD_STRENGTH_LABELS', CW_PASSWORD_STRENGTH_LABELS);
