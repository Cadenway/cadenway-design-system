import {
  Component,
  type TemplateRef,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
  booleanAttribute,
  input,
  viewChild,
} from '@angular/core';

/* `completed` has three values: unset, the step counts as done once the user moved past it. */
/**
 * Function optionalBoolean
 *
 * @description
 * Converts a template value to an optional boolean.
 *
 * @param {unknown} value - Template value to normalize.
 *
 * @returns {boolean | undefined} Boolean value, or undefined for a missing input.
 */
function optionalBoolean(value: unknown): boolean | undefined {
  return value === undefined || value === null ? undefined : booleanAttribute(value);
}

/**
 * Class CwStep
 * @class CwStep
 *
 * @description
 * A step of a `cw-stepper`: Instance, Équipe, Serveur e-mail (Stepper sheet of the Design System
 * artifact). Write the steps directly inside the stepper, in order.
 *
 * `label` (required) is short, a noun; `description` sits under it in a vertical stepper and
 * after « Étape 3 sur 5 — » in a horizontal one. Its projected content is the panel of the step,
 * shown only while the step is current; it stays alive between visits, so going back keeps what
 * was typed. `completed` marks it done; left unset, the step counts as done once the user moved
 * past it, and `[completed]="false"` keeps a linear stepper from moving on (an invalid form).
 * `optional` adds « (optionnelle) » and lets a linear stepper skip it. `error` (a message, or
 * `null`) shows the error state and the message (`role="alert"`). `editable` (true) lets the user
 * come back to it.
 */
@Component({
  selector: 'cw-step',
  templateUrl: './step.component.html',
})
export class CwStep {
  // #region Properties
  /**
   * Property label
   * @readonly
   *
   * @description
   * Name of the step.
   *
   * @type {InputSignal<string>}
   */
  public readonly label: InputSignal<string> = input.required<string>();

  /**
   * Property description
   * @readonly
   *
   * @description
   * One sentence on what to do in the step.
   *
   * @type {InputSignal<string>}
   */
  public readonly description: InputSignal<string> = input('');

  /**
   * Property optional
   * @readonly
   *
   * @description
   * The step may be skipped: « (optionnelle) ».
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly optional: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property completed
   * @readonly
   *
   * @description
   * Done (`true`), not done (`false`), or done once passed (unset).
   *
   * @type {InputSignalWithTransform<boolean | undefined, unknown>}
   */
  public readonly completed: InputSignalWithTransform<boolean | undefined, unknown> = input<
    boolean | undefined,
    unknown
  >(undefined, {
    transform: optionalBoolean,
  });

  /**
   * Property error
   * @readonly
   *
   * @description
   * Error message; `null` or empty for none.
   *
   * @type {InputSignal<string | null>}
   */
  public readonly error: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property editable
   * @readonly
   *
   * @description
   * Whether the user can come back to the step.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly editable: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property panelTemplate
   * @readonly
   *
   * @description
   * The panel of the step, rendered by the stepper while the step is current.
   *
   * @type {Signal<TemplateRef<unknown> | undefined>}
   */
  public readonly panelTemplate: Signal<TemplateRef<unknown> | undefined> =
    viewChild<TemplateRef<unknown>>('content');
  // #endregion
}
