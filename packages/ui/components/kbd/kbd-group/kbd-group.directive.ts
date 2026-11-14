import { Directive } from '@angular/core';

/**
 * Class CwKbdGroup
 * @class CwKbdGroup
 *
 * @description
 * A key combination: the `kbd[cwKbd]` keys it holds sit side by side, 4 px apart, with no « + »
 * between them (Kbd sheet of the Design System artifact).
 */
@Directive({
  selector: 'kbd[cwKbdGroup]',
  host: { class: 'inline-flex items-center gap-1 align-middle' },
})
export class CwKbdGroup {}
