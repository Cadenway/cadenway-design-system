import { Directive } from '@angular/core';

/**
 * Directive CwFieldSet
 *
 * @description
 * A set of fields under a legend: one form, or one section of a settings page (Field sheet).
 * Put it on a native `<fieldset>`, its first child a `legend[cwFieldLegend]`; `disabled` disables
 * every control inside, natively. Its 16 px gap sits behind `:where()`: a consumer's `gap-*`
 * class wins (mockup `Compte.dc.html`, the token scopes: `gap-2`).
 */
@Directive({
  selector: 'fieldset[cwFieldSet]',
  host: { class: 'flex min-w-0 flex-col [:where(&)]:gap-4' },
})
export class CwFieldSet {}
