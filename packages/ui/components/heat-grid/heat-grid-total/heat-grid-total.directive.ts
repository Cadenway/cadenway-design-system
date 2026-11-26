import { Directive, TemplateRef, inject, input, type InputSignal } from '@angular/core';

import type { CwHeatGridRow, CwHeatGridTotalContext } from '../heat-grid.types';

/**
 * Directive CwHeatGridTotalDef
 *
 * @description
 * An extra line of the total cell of each row, between the total and its meter: `<ng-template cwHeatGridTotal let-row let-total="total">` inside a `cw-heat-grid` (mockup `App.dc.html`, workload « Passé : 12 h »). `cwHeatGridTotalOf` only types `let-row` from the grid's rows; it renders nothing.
 */
@Directive({ selector: 'ng-template[cwHeatGridTotal]' })
export class CwHeatGridTotalDef<T> {
  // #region Properties
  /**
   * Property cwHeatGridTotalOf
   *
   * @description
   * The rows of the grid, for type inference only.
   *
   * @type {InputSignal<readonly CwHeatGridRow<T>[] | undefined>}
   * @readonly
   */
  public readonly cwHeatGridTotalOf: InputSignal<readonly CwHeatGridRow<T>[] | undefined> =
    input<readonly CwHeatGridRow<T>[]>();

  /**
   * Property template
   *
   * @description
   * The template stamped in each total cell.
   *
   * @type {TemplateRef<CwHeatGridTotalContext<T>>}
   * @readonly
   */
  public readonly template: TemplateRef<CwHeatGridTotalContext<T>> =
    inject<TemplateRef<CwHeatGridTotalContext<T>>>(TemplateRef);
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Types the `let-` variables of the template for the compiler.
   *
   * @param {CwHeatGridTotalDef<T>} _dir - Directive instance used by the template checker.
   * @param {unknown} _ctx - Unknown template context to narrow.
   * @returns {ctx is CwHeatGridTotalContext<T>} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard<T>(
    _dir: CwHeatGridTotalDef<T>,
    _ctx: unknown,
  ): _ctx is CwHeatGridTotalContext<T> {
    return true;
  }
  // #endregion
}
