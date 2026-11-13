import { Directive, computed, input } from '@angular/core';

import { ALIGNS } from './table.styles';
import type { CwTableAlign } from './table.types';

/** A data cell; `align="end"` right-aligns numbers in tabular figures (« 1 h 30 », « 1,2 Go »). */
@Directive({
  selector: 'td[cwTableCell]',
  host: { '[class]': 'classes()' },
})
export class CwTableCell {
  /** Alignment of the cell content. */
  readonly align = input<CwTableAlign>('start');

  protected readonly classes = computed(() => `px-3 align-middle ${ALIGNS[this.align()]}`);
}
