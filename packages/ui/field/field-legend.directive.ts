import { Directive } from '@angular/core';

/**
 * The title of a `fieldset[cwFieldSet]`, which names the set for assistive technologies. Put it on
 * the native `<legend>`, first child of the fieldset; a `cw-field-description` may follow it.
 */
@Directive({
  selector: 'legend[cwFieldLegend]',
  host: { class: 'mb-4 text-base font-semibold' },
})
export class CwFieldLegend {}
