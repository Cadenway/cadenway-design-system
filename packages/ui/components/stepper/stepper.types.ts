/**
 * Type CwStepperOrientation
 *
 * @description
 * Direction of a stepper: one row (dialogs, import pages) or one column (first installation).
 *
 * @type {'horizontal' | 'vertical'}
 */
export type CwStepperOrientation = 'horizontal' | 'vertical';

/**
 * Type CwStepperSize
 *
 * @description
 * Size of the indicators and labels; `sm` (16 px) is for a horizontal stepper in a dialog.
 *
 * @type {'default' | 'sm'}
 */
export type CwStepperSize = 'default' | 'sm';

/**
 * Type CwStepperVariant
 *
 * @description
 * How a stepper draws its steps: `default` numbered indicators joined by connectors, the reached
 * steps as buttons and the position line under the row; `segments` a segmented progress bar, one
 * bar per step with its label below, filled up to the current step by position alone, no step
 * clickable and no position line, for a journey whose screen writes the position itself (the
 * onboarding assistant of the mockup `App.dc.html`).
 *
 * @type {'default' | 'segments'}
 */
export type CwStepperVariant = 'default' | 'segments';

/**
 * Type CwStepState
 *
 * @description
 * What a step shows: done (check), current (ink ring), to do (dashed ring) or in error.
 *
 * @type {'done' | 'current' | 'todo' | 'error'}
 */
export type CwStepState = 'done' | 'current' | 'todo' | 'error';

/**
 * Interface CwStepperLabels
 *
 * @description
 * The texts of a stepper, French by default (Stepper sheet of the Design System artifact).
 */
export interface CwStepperLabels {
  // #region Properties
  /**
   * Property step
   * @readonly
   *
   * @description
   * Word of the hidden state after a label: « — étape 2, terminée ».
   *
   * @type {string}
   */
  readonly step: string;

  /**
   * Property done
   * @readonly
   *
   * @description
   * Hidden state of a done step.
   *
   * @type {string}
   */
  readonly done: string;

  /**
   * Property current
   * @readonly
   *
   * @description
   * Hidden state of the current step.
   *
   * @type {string}
   */
  readonly current: string;

  /**
   * Property todo
   * @readonly
   *
   * @description
   * Hidden state of a step to come.
   *
   * @type {string}
   */
  readonly todo: string;

  /**
   * Property error
   * @readonly
   *
   * @description
   * Hidden state of a step in error.
   *
   * @type {string}
   */
  readonly error: string;

  /**
   * Property optional
   * @readonly
   *
   * @description
   * Mention after the label of an optional step.
   *
   * @type {string}
   */
  readonly optional: string;

  /**
   * Property position
   * @readonly
   *
   * @description
   * First word of the position: « Étape 3 sur 5 ».
   *
   * @type {string}
   */
  readonly position: string;

  /**
   * Property of
   * @readonly
   *
   * @description
   * Word between the position and the count: « Étape 3 sur 5 ».
   *
   * @type {string}
   */
  readonly of: string;
  // #endregion
}

/**
 * Interface CwStepperProvidedLabels
 *
 * @description
 * Complete default texts accepted by the provider, including dedicated input defaults.
 */
export interface CwStepperProvidedLabels extends CwStepperLabels {
  // #region Properties
  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name of the step list.
   *
   * @type {string}
   * @readonly
   */
  readonly ariaLabel: string;
  // #endregion
}
