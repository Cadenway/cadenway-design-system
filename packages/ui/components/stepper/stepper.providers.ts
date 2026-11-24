import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { STEPPER_LABELS } from './stepper-labels.token';
import { CW_STEPPER_LABELS } from './stepper.constants';
import type { CwStepperProvidedLabels } from './stepper.types';

/**
 * Function provideCwStepperLabels
 *
 * @description
 * Provides texts to stepper declarations in an application, route or component subtree.
 * Values merge over the parent and French defaults; explicit inputs still take precedence. A
 * factory runs once in an injection context when the labels are first read.
 *
 * @param {Partial<CwStepperProvidedLabels> | (() => Partial<CwStepperProvidedLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwStepperLabels(
  labels: Partial<CwStepperProvidedLabels> | (() => Partial<CwStepperProvidedLabels>),
): Provider {
  return ɵprovideLabels(STEPPER_LABELS, CW_STEPPER_LABELS, labels);
}
