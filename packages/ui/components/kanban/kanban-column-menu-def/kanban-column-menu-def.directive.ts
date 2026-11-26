import { DestroyRef, Directive, TemplateRef, inject } from '@angular/core';

import { KANBAN_BOARD, type KanbanBoard } from '../kanban.token';
import type { CwKanbanColumnMenuContext } from '../kanban.types';

/**
 * Directive CwKanbanColumnMenuDef
 *
 * @description
 * The menu slot of an open column header of a `cw-kanban`: `<ng-template cwKanbanColumnMenu
 * let-column let-count="count">`. It is drawn after the count, before « + » and the fold button,
 * typically a ghost icon button with `[cwMenuTriggerFor]` opening the column actions (mockup
 * `App.dc.html`, column context menu: new task in the column, fold, hide). It receives the column
 * and its card count; it is not drawn on a folded band. It registers with the enclosing board, so
 * it must be a direct child of `cw-kanban`'s content.
 */
@Directive({ selector: 'ng-template[cwKanbanColumnMenu]' })
export class CwKanbanColumnMenuDef {
  // #region Properties
  /**
   * Property template
   *
   * @description
   * The template, read by the board.
   *
   * @type {TemplateRef<CwKanbanColumnMenuContext>}
   * @readonly
   */
  public readonly template: TemplateRef<CwKanbanColumnMenuContext> =
    inject<TemplateRef<CwKanbanColumnMenuContext>>(TemplateRef);
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Registers the template with the enclosing board, and clears it when the slot is destroyed.
   *
   * @constructor
   */
  public constructor() {
    const board: KanbanBoard | null = inject(KANBAN_BOARD, { optional: true });
    board?.registerColumnMenu(this.template);
    inject(DestroyRef).onDestroy(() => {
      board?.registerColumnMenu(undefined);
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Types the template context for the template type checker.
   *
   * @param {CwKanbanColumnMenuDef} _directive - Directive instance used by the template checker.
   * @param {unknown} _context - Unknown template context to narrow.
   * @returns {context is CwKanbanColumnMenuContext} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard(
    _directive: CwKanbanColumnMenuDef,
    _context: unknown,
  ): _context is CwKanbanColumnMenuContext {
    return true;
  }
  // #endregion
}
