import { Directive } from '@angular/core';

/**
 * Class CwTableHeader
 * @class CwTableHeader
 *
 * @description
 * Styles the native table header with a rule under each header row.
 */
@Directive({
  selector: 'thead[cwTableHeader]',
  host: { class: '[&_tr]:border-b' },
})
export class CwTableHeader {}
