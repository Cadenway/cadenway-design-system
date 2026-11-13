import { Component, type TemplateRef, booleanAttribute, input, viewChild } from '@angular/core';

/* `completed` has three values: unset, the step counts as done once the user moved past it. */
function optionalBoolean(value: unknown): boolean | undefined {
  return value === undefined || value === null ? undefined : booleanAttribute(value);
}

/**
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
  /** Name of the step. */
  readonly label = input.required<string>();
  /** One sentence on what to do in the step. */
  readonly description = input('');
  /** The step may be skipped: « (optionnelle) ». */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Done (`true`), not done (`false`), or done once passed (unset). */
  readonly completed = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBoolean,
  });
  /** Error message; `null` or empty for none. */
  readonly error = input<string | null>(null);
  /** Whether the user can come back to the step. */
  readonly editable = input(true, { transform: booleanAttribute });

  /** @internal The panel of the step, rendered by the stepper while the step is current. */
  readonly panelTemplate = viewChild<TemplateRef<unknown>>('content');
}
