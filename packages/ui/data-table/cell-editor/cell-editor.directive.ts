import { Directive, TemplateRef, inject, input } from '@angular/core';

import type { CwCellEditorContext } from '../data-table.types';

/**
 * The inline editor of a column: `<ng-template cwCellEditor let-row let-commit="commit"
 * let-cancel="cancel">` inside a `cw-data-table-column` (DataTableComplete sheet).
 *
 * Enter on an editable cell (or F2, or a double click) replaces the cell by this template and moves
 * the focus into it. Call `commit(value)` on Enter and on `(blur)`: the table emits `cellEdit` and
 * closes the editor; Escape cancels and gives back the original value; Tab validates (through the
 * blur) and opens the next editable cell. Give the field the editor look of the sheet:
 * `h-7 rounded-md border border-input bg-background -mx-1.5` with the focus ring of a field.
 * `cwCellEditorOf` only types `let-row`.
 */
@Directive({ selector: 'ng-template[cwCellEditor]' })
export class CwCellEditorDef<T> {
  /** The rows of the table, for type inference only. */
  readonly cwCellEditorOf = input<readonly T[]>();

  /** The template the table stamps in the edited cell. */
  readonly template = inject<TemplateRef<CwCellEditorContext<T>>>(TemplateRef);

  /** Types the `let-` variables of the template for the compiler. */
  // The compiler reads the signature only: the parameters exist for their types.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static ngTemplateContextGuard<T>(
    _dir: CwCellEditorDef<T>,
    ctx: unknown,
  ): ctx is CwCellEditorContext<T> {
    return true;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
