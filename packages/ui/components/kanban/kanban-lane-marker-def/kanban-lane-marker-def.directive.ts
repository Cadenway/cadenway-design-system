import { Directive, TemplateRef, inject } from '@angular/core';

import type { CwKanbanLaneMarkerContext } from '../kanban.types';

/**
 * Directive CwKanbanLaneMarkerDef
 *
 * @description
 * The marker drawn before a swimlane's label in a `cw-kanban`: `<ng-template cwKanbanLaneMarker let-lane>`, priority bars or an `xs` avatar (Kanban sheet, "Variantes"). It receives the lane; without it, the header shows the label alone.
 */
@Directive({ selector: 'ng-template[cwKanbanLaneMarker]' })
export class CwKanbanLaneMarkerDef {
  // #region Properties
  /**
   * Property template
   *
   * @description
   * The template, read by the board.
   *
   * @type {TemplateRef<CwKanbanLaneMarkerContext>}
   * @readonly
   */
  public readonly template: TemplateRef<CwKanbanLaneMarkerContext> =
    inject<TemplateRef<CwKanbanLaneMarkerContext>>(TemplateRef);
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Types the template context for the template type checker.
   *
   * @param {CwKanbanLaneMarkerDef} _directive - Directive instance used by the template checker.
   * @param {unknown} _context - Unknown template context to narrow.
   * @returns {context is CwKanbanLaneMarkerContext} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard(
    _directive: CwKanbanLaneMarkerDef,
    _context: unknown,
  ): _context is CwKanbanLaneMarkerContext {
    return true;
  }
  // #endregion
}
