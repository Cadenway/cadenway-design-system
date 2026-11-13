import { Directive, TemplateRef, inject, input } from '@angular/core';

import type { CwCellContext } from '../data-table.types';

/**
 * The rendering of the cells of a column: `<ng-template cwCell let-row>` inside a
 * `cw-data-table-column` (DataTable sheet of the Design System artifact).
 *
 * The context gives the row (`let-row`), its `value` and `open` (emits the table's `rowOpen`).
 * Interactive content inside a cell leaves the tab order: the grid has a single tab stop and its
 * controls are reached with Tab from the active cell. `cwCellOf` only types `let-row` from the
 * table's data (`[cwCellOf]="tasks()"`); it renders nothing.
 */
@Directive({ selector: 'ng-template[cwCell]' })
export class CwCellDef<T> {
  /** The rows of the table, for type inference only. */
  readonly cwCellOf = input<readonly T[]>();

  /** The template the table stamps in every cell of the column. */
  readonly template = inject<TemplateRef<CwCellContext<T>>>(TemplateRef);

  /** Types the `let-` variables of the template for the compiler. */
  // The compiler reads the signature only: the parameters exist for their types.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static ngTemplateContextGuard<T>(_dir: CwCellDef<T>, ctx: unknown): ctx is CwCellContext<T> {
    return true;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
