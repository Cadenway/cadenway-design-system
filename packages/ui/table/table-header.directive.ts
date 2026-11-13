import { Directive } from '@angular/core';

/** The header of a table: a rule under its row. */
@Directive({
  selector: 'thead[cwTableHeader]',
  host: { class: '[&_tr]:border-b' },
})
export class CwTableHeader {}
