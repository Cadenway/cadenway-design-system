/*
 * Public API of @cadenway/ui/stepper (Stepper sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwStepper } from './stepper.component';
export { CwStep } from './step/step.component';
export type {
  CwStepState,
  CwStepperLabels,
  CwStepperProvidedLabels,
  CwStepperOrientation,
  CwStepperSize,
  CwStepperTone,
  CwStepperVariant,
} from './stepper.types';

export { CW_STEPPER_LABELS } from './stepper.constants';
export { provideCwStepperLabels } from './stepper.providers';
