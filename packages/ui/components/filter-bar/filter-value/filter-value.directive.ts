import { Directive, TemplateRef, inject, input, type InputSignal } from '@angular/core';

import type { CwFilterValueContext } from '../filter-bar.types';

/**
 * Directive CwFilterValueDef
 *
 * @description
 * Replaces the content of the value segment of the chips of one field (Filter Bar sheet: `ng-template cwFilterValue`), for a value the default summary cannot show. `<ng-template cwFilterValue="due" let-filter let-field="field">…</ng-template>` inside `cw-filter-bar` or a standalone `cw-filter-chip`; the value is the field's `key`. The segment stays a button that opens the value editor: render text and decorative media only.
 */
@Directive({ selector: 'ng-template[cwFilterValue]' })
export class CwFilterValueDef {
  // #region Properties
  /**
   * Property cwFilterValue
   *
   * @description
   * `key` of the field the template renders.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly cwFilterValue: InputSignal<string> = input.required<string>();

  /**
   * Property ɵtemplate
   *
   * @description
   * The template. Not public API.
   *
   * @type {TemplateRef<CwFilterValueContext>}
   * @readonly
   */
  public readonly ɵtemplate: TemplateRef<CwFilterValueContext> =
    inject<TemplateRef<CwFilterValueContext>>(TemplateRef);
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Types `let-` variables of the template for the compiler.
   *
   * @param {CwFilterValueDef} _dir - Directive instance used by the template checker.
   * @param {unknown} _ctx - Unknown template context to narrow.
   * @returns {ctx is CwFilterValueContext} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard(
    _dir: CwFilterValueDef,
    _ctx: unknown,
  ): _ctx is CwFilterValueContext {
    return true;
  }
  // #endregion
}
