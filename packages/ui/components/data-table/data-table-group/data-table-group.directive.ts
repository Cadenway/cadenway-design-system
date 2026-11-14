import { Directive, TemplateRef, inject } from '@angular/core';

import type { CwGroupContext } from '../data-table.types';

/**
 * Directive CwDataTableGroup
 *
 * @description
 * What a group row shows between its chevron and its count: `<ng-template cwDataTableGroup let-key let-label="label">` inside `cw-data-table` (a status icon and its label, a person). The table knows no status: without this template the group row shows `groupLabel(key)`.
 */
@Directive({ selector: 'ng-template[cwDataTableGroup]' })
export class CwDataTableGroup {
  // #region Properties
  /**
   * Property template
   *
   * @description
   * The template the table stamps in every group row.
   *
   * @type {TemplateRef<CwGroupContext>}
   * @readonly
   */
  public readonly template: TemplateRef<CwGroupContext> =
    inject<TemplateRef<CwGroupContext>>(TemplateRef);
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Types the `let-` variables of the template for the compiler.
   *
   * @param {CwDataTableGroup} _dir - Directive instance used by the template checker.
   * @param {unknown} _ctx - Unknown template context to narrow.
   * @returns {ctx is CwGroupContext} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard(
    _dir: CwDataTableGroup,
    _ctx: unknown,
  ): _ctx is CwGroupContext {
    return true;
  }
  // #endregion
}
