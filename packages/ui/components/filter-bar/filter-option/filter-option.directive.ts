import { Directive, TemplateRef, inject, input, type InputSignal } from '@angular/core';

import type { CwFilterOptionContext } from '../filter-bar.types';

/**
 * Directive CwFilterOptionDef
 *
 * @description
 * The leading media of the options of one field, in the values menu and in the value segment: a status icon, an avatar (Filter Bar sheet, anatomy 2.3 and 6). It replaces the option's `icon`. `<ng-template cwFilterOption="status" let-option>…</ng-template>` inside `cw-filter-bar` or a standalone `cw-filter-chip`; the value is the field's `key`. Render a 16 px decorative element: the option's label is always written next to it.
 */
@Directive({ selector: 'ng-template[cwFilterOption]' })
export class CwFilterOptionDef {
  // #region Properties
  /**
   * Property cwFilterOption
   *
   * @description
   * `key` of the field whose options the template renders.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly cwFilterOption: InputSignal<string> = input.required<string>();

  /**
   * Property ɵtemplate
   *
   * @description
   * The template. Not public API.
   *
   * @type {TemplateRef<CwFilterOptionContext>}
   * @readonly
   */
  public readonly ɵtemplate: TemplateRef<CwFilterOptionContext> =
    inject<TemplateRef<CwFilterOptionContext>>(TemplateRef);
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Types `let-` variables of the template for the compiler.
   *
   * @param {CwFilterOptionDef} _dir - Directive instance used by the template checker.
   * @param {unknown} _ctx - Unknown template context to narrow.
   * @returns {ctx is CwFilterOptionContext} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard(
    _dir: CwFilterOptionDef,
    _ctx: unknown,
  ): _ctx is CwFilterOptionContext {
    return true;
  }
  // #endregion
}
