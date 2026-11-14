import { Directive } from '@angular/core';

/**
 * Directive CwFieldSet
 *
 * @description
 * A set of fields under a legend: one form, or one section of a settings page (Field sheet).
 * Put it on a native `<fieldset>`, its first child a `legend[cwFieldLegend]`; `disabled` disables
 * every control inside, natively.
 */
@Directive({
  selector: 'fieldset[cwFieldSet]',
  host: { class: 'flex min-w-0 flex-col gap-4' },
})
export class CwFieldSet {}
