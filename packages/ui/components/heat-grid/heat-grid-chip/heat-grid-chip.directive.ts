import { Directive, TemplateRef, inject, input, type InputSignal } from '@angular/core';

import type { CwHeatGridItemContext, CwHeatGridRow } from '../heat-grid.types';

/**
 * Directive CwHeatGridChipDef
 *
 * @description
 * The rendering of an item of a cell: `<ng-template cwHeatGridChip let-item let-placement="placement">` inside a `cw-heat-grid`. The grid stamps it for the first `maxChips` items of a cell (`placement` `cell`) and for every item of the open popover (`placement` `popover`). Controls inside a cell leave the tab order except in the active cell, reached with Tab. `cwHeatGridChipOf` only types `let-item` from the grid's rows (`[cwHeatGridChipOf]="rows()"`); it renders nothing.
 */
@Directive({ selector: 'ng-template[cwHeatGridChip]' })
export class CwHeatGridChipDef<T> {
  // #region Properties
  /**
   * Property cwHeatGridChipOf
   *
   * @description
   * The rows of the grid, for type inference only.
   *
   * @type {InputSignal<readonly CwHeatGridRow<T>[] | undefined>}
   * @readonly
   */
  public readonly cwHeatGridChipOf: InputSignal<readonly CwHeatGridRow<T>[] | undefined> =
    input<readonly CwHeatGridRow<T>[]>();

  /**
   * Property template
   *
   * @description
   * The template stamped for each drawn item.
   *
   * @type {TemplateRef<CwHeatGridItemContext<T>>}
   * @readonly
   */
  public readonly template: TemplateRef<CwHeatGridItemContext<T>> =
    inject<TemplateRef<CwHeatGridItemContext<T>>>(TemplateRef);
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Types the `let-` variables of the template for the compiler.
   *
   * @param {CwHeatGridChipDef<T>} _dir - Directive instance used by the template checker.
   * @param {unknown} _ctx - Unknown template context to narrow.
   * @returns {ctx is CwHeatGridItemContext<T>} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard<T>(
    _dir: CwHeatGridChipDef<T>,
    _ctx: unknown,
  ): _ctx is CwHeatGridItemContext<T> {
    return true;
  }
  // #endregion
}
