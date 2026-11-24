import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_STEPPER_LABELS } from './stepper.constants';
import type { CwStepperProvidedLabels } from './stepper.types';

/**
 * Constant STEPPER_LABELS
 *
 * @description
 * Texts inherited by stepper declarations from the nearest provider.
 *
 * @type {InjectionToken<CwStepperProvidedLabels>}
 */
export const STEPPER_LABELS: InjectionToken<CwStepperProvidedLabels> =
  ɵlabelsToken<CwStepperProvidedLabels>('STEPPER_LABELS', CW_STEPPER_LABELS);
