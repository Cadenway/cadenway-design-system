import {
  DestroyRef,
  Directive,
  TemplateRef,
  inject,
  input,
  untracked,
  type InputSignal,
} from '@angular/core';

import { CwDataTableColumn } from '../data-table-column/data-table-column.component';
import type { CwFooterCellContext } from '../data-table.types';

/**
 * Directive CwFooterCellDef
 *
 * @description
 * The rendering of the footer cell of a column: `<ng-template cwFooterCell let-rows let-value="value">` inside a `cw-data-table-column`. The footer row is sticky at the bottom of the grid and shows once a visible column has a `footer` function or this template; the context gives every row of `data` (`let-rows`) and the column's `footer` result (`value`). `cwFooterCellOf` only types `let-rows` from the table's data (`[cwFooterCellOf]="tasks()"`); it renders nothing.
 */
@Directive({ selector: 'ng-template[cwFooterCell]' })
export class CwFooterCellDef<T> {
  // #region Properties
  /**
   * Property cwFooterCellOf
   *
   * @description
   * The rows of the table, for type inference only.
   *
   * @type {InputSignal<readonly T[] | undefined>}
   * @readonly
   */
  public readonly cwFooterCellOf: InputSignal<readonly T[] | undefined> = input<readonly T[]>();

  /**
   * Property template
   *
   * @description
   * The template the table stamps in the footer cell of the column.
   *
   * @type {TemplateRef<CwFooterCellContext<T>>}
   * @readonly
   */
  public readonly template: TemplateRef<CwFooterCellContext<T>> =
    inject<TemplateRef<CwFooterCellContext<T>>>(TemplateRef);
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Registers the template with its `cw-data-table-column`, and removes it when destroyed; outside a column it does nothing.
   *
   * @constructor
   */
  public constructor() {
    const column: CwDataTableColumn | null = inject(CwDataTableColumn, { optional: true });
    if (!column) return;
    const template: TemplateRef<CwFooterCellContext<unknown>> = this.template;
    // Created while the column's content renders: the write happens outside any reactive context.
    untracked(() => {
      column.ɵfooterCell.set(template);
    });
    inject(DestroyRef).onDestroy(() => {
      if (untracked(column.ɵfooterCell) === template) column.ɵfooterCell.set(null);
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Types the `let-` variables of the template for the compiler.
   *
   * @param {CwFooterCellDef<T>} _dir - Directive instance used by the template checker.
   * @param {unknown} _ctx - Unknown template context to narrow.
   * @returns {ctx is CwFooterCellContext<T>} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard<T>(
    _dir: CwFooterCellDef<T>,
    _ctx: unknown,
  ): _ctx is CwFooterCellContext<T> {
    return true;
  }
  // #endregion
}
