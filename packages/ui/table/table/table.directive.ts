import { Directive, input } from '@angular/core';

import type { CwTableSize } from '../table.types';

/**
 * A styled native table for simple read-only data (time spent, audit log, storage quotas, import
 * summary): no sorting, selection or grouping, which belong to `cw-data-table` (Table sheet of the
 * Design System artifact).
 *
 * Put it on a native `<table>` and compose with `thead[cwTableHeader]`, `tbody[cwTableBody]`,
 * `tfoot[cwTableFooter]`, `tr[cwTableRow]`, `th[cwTableHead]`, `td[cwTableCell]` and
 * `caption[cwTableCaption]`, in a `cw-table-container` for horizontal scrolling. `size` sets the row
 * heights of every part. Name the table with a caption or an `aria-label`; while loading, set
 * `aria-busy="true"` on it.
 */
@Directive({
  selector: 'table[cwTable]',
  host: {
    class: 'w-full caption-bottom text-sm',
    '[attr.data-size]': 'size()',
  },
})
export class CwTable {
  /** Row height, passed down to the header, body and footer rows. */
  readonly size = input<CwTableSize>('default');
}
