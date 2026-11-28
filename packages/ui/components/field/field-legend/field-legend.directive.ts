import { Directive } from '@angular/core';

/**
 * Directive CwFieldLegend
 *
 * @description
 * The title of a `fieldset[cwFieldSet]`, which names the set for assistive technologies. Put it on
 * the native `<legend>`, first child of the fieldset; a `cw-field-description` may follow it. Its
 * margin and type sit behind `:where()`: a consumer's `mb-*`, `text-*` and `font-*` classes win
 * (mockup `Compte.dc.html`, the token scopes: `mb-1 text-sm font-medium`).
 */
@Directive({
  selector: 'legend[cwFieldLegend]',
  host: { class: '[:where(&)]:mb-4 [:where(&)]:text-base [:where(&)]:font-semibold' },
})
export class CwFieldLegend {}
