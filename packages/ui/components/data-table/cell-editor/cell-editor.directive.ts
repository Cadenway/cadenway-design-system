import { Directive, TemplateRef, inject, input, type InputSignal } from '@angular/core';

import type { CwCellEditorContext } from '../data-table.types';

/**
 * Directive CwCellEditorDef
 *
 * @description
 * The inline editor of a column: `<ng-template cwCellEditor let-row let-commit="commit" let-cancel="cancel">` inside a `cw-data-table-column` (DataTableComplete sheet). Enter on an editable cell (or F2, or a double click) replaces the cell by this template and moves the focus into it. Call `commit(value)` on Enter and on `(blur)`: the table emits `cellEdit` and closes the editor; Escape cancels and gives back the original value; Tab validates (through the blur) and opens the next editable cell. Give the field the editor look of the sheet: `h-7 rounded-md border border-input bg-background -mx-1.5` with the focus ring of a field. `cwCellEditorOf` only types `let-row`.
 */
@Directive({ selector: 'ng-template[cwCellEditor]' })
export class CwCellEditorDef<T> {
  // #region Properties
  /**
   * Property cwCellEditorOf
   *
   * @description
   * The rows of the table, for type inference only.
   *
   * @type {InputSignal<readonly T[] | undefined>}
   * @readonly
   */
  public readonly cwCellEditorOf: InputSignal<readonly T[] | undefined> = input<readonly T[]>();

  /**
   * Property template
   *
   * @description
   * The template the table stamps in the edited cell.
   *
   * @type {TemplateRef<CwCellEditorContext<T>>}
   * @readonly
   */
  public readonly template: TemplateRef<CwCellEditorContext<T>> =
    inject<TemplateRef<CwCellEditorContext<T>>>(TemplateRef);
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Types the `let-` variables of the template for the compiler.
   *
   * @param {CwCellEditorDef<T>} _dir - Directive instance used by the template checker.
   * @param {unknown} _ctx - Unknown template context to narrow.
   * @returns {ctx is CwCellEditorContext<T>} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard<T>(
    _dir: CwCellEditorDef<T>,
    _ctx: unknown,
  ): _ctx is CwCellEditorContext<T> {
    return true;
  }
  // #endregion
}
