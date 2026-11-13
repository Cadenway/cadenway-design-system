import { Directive } from '@angular/core';

/** The body of a table: rows separated by rules, none under the last one. */
@Directive({
  selector: 'tbody[cwTableBody]',
  host: { class: '[&_tr:last-child]:border-0' },
})
export class CwTableBody {}
