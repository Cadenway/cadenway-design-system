import { Directive, computed, inject } from '@angular/core';

import { CwTableFooter } from '../table-footer/table-footer.directive';
import { CwTableHeader } from '../table-header/table-header.directive';
import { CwTable } from '../table/table.directive';
import type { CwTableSize } from '../table.types';

/* Literal class strings (Table sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. */
const BODY_ROWS: Record<CwTableSize, string> = {
  default: 'h-10 border-b transition-colors hover:bg-accent motion-reduce:transition-none',
  sm: 'h-8 border-b transition-colors hover:bg-accent motion-reduce:transition-none',
};

const HEADER_ROWS: Record<CwTableSize, string> = {
  default: 'h-9',
  sm: 'h-8',
};

const FOOTER_ROWS: Record<CwTableSize, string> = {
  default: 'h-10',
  sm: 'h-8',
};

/**
 * A row: in the body, a 40 px (32 px in `sm`) row with a rule and the hover veil; in the header and
 * the footer, the row height only.
 */
@Directive({
  selector: 'tr[cwTableRow]',
  host: { '[class]': 'classes()' },
})
export class CwTableRow {
  private readonly table = inject(CwTable, { optional: true });
  private readonly header = inject(CwTableHeader, { optional: true });
  private readonly footer = inject(CwTableFooter, { optional: true });

  protected readonly classes = computed(() => {
    const size = this.table?.size() ?? 'default';
    if (this.header) return HEADER_ROWS[size];
    if (this.footer) return FOOTER_ROWS[size];
    return BODY_ROWS[size];
  });
}
