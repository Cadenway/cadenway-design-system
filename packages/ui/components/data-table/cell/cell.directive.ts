import { Directive, TemplateRef, inject, input, type InputSignal } from '@angular/core';

import type { CwCellContext } from '../data-table.types';

/**
 * Directive CwCellDef
 *
 * @description
 * The rendering of the cells of a column: `<ng-template cwCell let-row>` inside a `cw-data-table-column` (DataTable sheet of the Design System artifact). The context gives the row (`let-row`), its `value` and `open` (emits the table's `rowOpen`). Interactive content inside a cell leaves the tab order: the grid has a single tab stop and its controls are reached with Tab from the active cell. `cwCellOf` only types `let-row` from the table's data (`[cwCellOf]="tasks()"`); it renders nothing.
 */
@Directive({ selector: 'ng-template[cwCell]' })
export class CwCellDef<T> {
  // #region Properties
  /**
   * Property cwCellOf
   *
   * @description
   * The rows of the table, for type inference only.
   *
   * @type {InputSignal<readonly T[] | undefined>}
   * @readonly
   */
  public readonly cwCellOf: InputSignal<readonly T[] | undefined> = input<readonly T[]>();

  /**
   * Property template
   *
   * @description
   * The template the table stamps in every cell of the column.
   *
   * @type {TemplateRef<CwCellContext<T>>}
   * @readonly
   */
  public readonly template: TemplateRef<CwCellContext<T>> =
    inject<TemplateRef<CwCellContext<T>>>(TemplateRef);
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Types the `let-` variables of the template for the compiler.
   *
   * @param {CwCellDef<T>} _dir - Directive instance used by the template checker.
   * @param {unknown} _ctx - Unknown template context to narrow.
   * @returns {ctx is CwCellContext<T>} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard<T>(
    _dir: CwCellDef<T>,
    _ctx: unknown,
  ): _ctx is CwCellContext<T> {
    return true;
  }
  // #endregion
}
