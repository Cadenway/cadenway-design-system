import { Directive } from '@angular/core';

/** The footer of a table, for totals: a rule above, a muted background, medium weight. */
@Directive({
  selector: 'tfoot[cwTableFooter]',
  host: { class: 'border-t bg-muted font-medium' },
})
export class CwTableFooter {}
