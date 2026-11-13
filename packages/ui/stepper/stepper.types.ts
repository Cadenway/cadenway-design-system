/** Direction of a stepper: one row (dialogs, import pages) or one column (first installation). */
export type CwStepperOrientation = 'horizontal' | 'vertical';

/** Size of the indicators and labels; `sm` (16 px) is for a horizontal stepper in a dialog. */
export type CwStepperSize = 'default' | 'sm';

/** What a step shows: done (check), current (ink ring), to do (dashed ring) or in error. */
export type CwStepState = 'done' | 'current' | 'todo' | 'error';

/** The texts of a stepper, French by default (Stepper sheet of the Design System artifact). */
export interface CwStepperLabels {
  /** Word of the hidden state after a label: « — étape 2, terminée ». */
  readonly step: string;
  /** Hidden state of a done step. */
  readonly done: string;
  /** Hidden state of the current step. */
  readonly current: string;
  /** Hidden state of a step to come. */
  readonly todo: string;
  /** Hidden state of a step in error. */
  readonly error: string;
  /** Mention after the label of an optional step. */
  readonly optional: string;
  /** First word of the position: « Étape 3 sur 5 ». */
  readonly position: string;
  /** Word between the position and the count: « Étape 3 sur 5 ». */
  readonly of: string;
}
