import { Directive, TemplateRef, inject } from '@angular/core';

import type { CwRelationLeadingContext } from '../relations.types';

/**
 * Directive CwRelationLeading
 *
 * @description
 * The consumer's glyph at the start of each relation row and picker result: the status icon of a
 * task, named (`role="img"`), for instance (Relations sheet of the Design System artifact). Put it
 * on an `ng-template` inside `cw-relations` or `cw-relation-picker`; `let-item` is the
 * `CwRelationItem`.
 */
@Directive({
  selector: 'ng-template[cwRelationLeading]',
})
export class CwRelationLeading {
  // #region Properties
  /**
   * Property template
   *
   * @description
   * Projected template used to render the leading content.
   *
   * @type {TemplateRef<CwRelationLeadingContext>}
   * @readonly
   * @internal
   */
  public readonly template: TemplateRef<CwRelationLeadingContext> =
    inject<TemplateRef<CwRelationLeadingContext>>(TemplateRef);
  // #endregion

  // The compiler reads the signature only: the parameters exist for their types.
  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Declares the projected template context type for Angular's template checker.
   *
   * @param {CwRelationLeading} _directive - Directive instance used by the template checker.
   * @param {unknown} _context - Context to narrow for the template.
   * @returns {context is CwRelationLeadingContext} Whether the context has the declared type.
   */
  public static ngTemplateContextGuard(
    _directive: CwRelationLeading,
    _context: unknown,
  ): _context is CwRelationLeadingContext {
    return true;
  }
  // #endregion
}
