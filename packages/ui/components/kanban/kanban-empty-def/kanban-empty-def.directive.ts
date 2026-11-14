import { Directive, TemplateRef, inject } from '@angular/core';

import type { CwKanbanEmptyContext } from '../kanban.types';

/**
 * Directive CwKanbanEmptyDef
 *
 * @description
 * The text of an empty column of a `cw-kanban`: `<ng-template cwKanbanEmpty let-column>`. It replaces the default title and sentence (« Aucune tâche », « Déposez une carte ici ou créez une tâche. »); the tray media and the « Ajouter une tâche » button stay. It receives the column.
 */
@Directive({ selector: 'ng-template[cwKanbanEmpty]' })
export class CwKanbanEmptyDef {
  // #region Properties
  /**
   * Property template
   *
   * @description
   * The template, read by the board.
   *
   * @type {TemplateRef<CwKanbanEmptyContext>}
   * @readonly
   */
  public readonly template: TemplateRef<CwKanbanEmptyContext> =
    inject<TemplateRef<CwKanbanEmptyContext>>(TemplateRef);
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Types the template context for the template type checker.
   *
   * @param {CwKanbanEmptyDef} _directive - Directive instance used by the template checker.
   * @param {unknown} _context - Unknown template context to narrow.
   * @returns {context is CwKanbanEmptyContext} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard(
    _directive: CwKanbanEmptyDef,
    _context: unknown,
  ): _context is CwKanbanEmptyContext {
    return true;
  }
  // #endregion
}
