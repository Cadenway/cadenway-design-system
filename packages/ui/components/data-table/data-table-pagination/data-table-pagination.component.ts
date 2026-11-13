import { Component, inject } from '@angular/core';
import { CwPagination } from '@cadenway/ui/components/pagination';

import { ɵCW_DATA_TABLE } from '../data-table.token';

/**
 * The footer of a paged table: the range (« 1–25 sur 128 tâches », announced politely), then the
 * table bar of `cw-pagination` (« Lignes par page », « Page n sur N », previous and next, disabled
 * at the bounds) (DataTable sheets, "Pied" and "Pagination"; mockup `Organisation.dc.html`
 * members).
 *
 * `cw-data-table` renders it whenever its `page` is not `null`; it reads and drives the table's
 * `page` and `pageSize` models. Changing the page keeps the selection and scrolls the grid back to
 * its top; changing the page size goes back to page 1.
 */
@Component({
  selector: 'cw-data-table-pagination',
  imports: [CwPagination],
  host: { class: 'block shrink-0' },
  templateUrl: './data-table-pagination.component.html',
})
export class CwDataTablePagination {
  protected readonly table = inject(ɵCW_DATA_TABLE);

  protected current(): number {
    return Math.min(Math.max(1, this.table.page() ?? 1), this.table.pageCount());
  }
}
