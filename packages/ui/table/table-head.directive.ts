import { Directive, HostAttributeToken, computed, inject, input } from '@angular/core';

import { ALIGNS } from './table.styles';
import type { CwTableAlign } from './table.types';

/**
 * A column header: muted, `text-xs`, on one line, `scope="col"` unless another scope is given.
 * `align="end"` for numeric columns.
 */
@Directive({
  selector: 'th[cwTableHead]',
  host: {
    '[class]': 'classes()',
    '[attr.scope]': 'scope ?? "col"',
  },
})
export class CwTableHead {
  /** Alignment of the header text; match the cells of the column. */
  readonly align = input<CwTableAlign>('start');

  protected readonly scope = inject(new HostAttributeToken('scope'), { optional: true });
  protected readonly classes = computed(
    () =>
      `px-3 align-middle text-xs font-medium whitespace-nowrap text-muted-foreground ${ALIGNS[this.align()]}`,
  );
}
