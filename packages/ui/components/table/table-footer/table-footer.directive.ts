import { Directive } from '@angular/core';

/**
 * Class CwTableFooter
 * @class CwTableFooter
 *
 * @description
 * Styles a native table footer for totals with a top rule and muted background.
 */
@Directive({
  selector: 'tfoot[cwTableFooter]',
  host: { class: 'border-t bg-muted font-medium' },
})
export class CwTableFooter {}
