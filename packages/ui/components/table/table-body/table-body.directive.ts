import { Directive } from '@angular/core';

/**
 * Class CwTableBody
 * @class CwTableBody
 *
 * @description
 * Styles the table body with row separators, omitting the last row's rule.
 */
@Directive({
  selector: 'tbody[cwTableBody]',
  host: { class: '[&_tr:last-child]:border-0' },
})
export class CwTableBody {}
