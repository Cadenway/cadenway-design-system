import { Directive, TemplateRef, inject } from '@angular/core';

import type { CwKanbanEmptyContext } from '../kanban.types';

/**
 * The text of an empty column of a `cw-kanban`: `<ng-template cwKanbanEmpty let-column>`.
 *
 * It replaces the default title and sentence (« Aucune tâche », « Déposez une carte ici ou créez une
 * tâche. »); the tray media and the « Ajouter une tâche » button stay. It receives the column.
 */
@Directive({ selector: 'ng-template[cwKanbanEmpty]' })
export class CwKanbanEmptyDef {
  /** The template, read by the board. */
  readonly template = inject<TemplateRef<CwKanbanEmptyContext>>(TemplateRef);

  /** Types the template context for the template type checker. */
  // The compiler reads the signature only: the parameters exist for their types.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static ngTemplateContextGuard(
    _directive: CwKanbanEmptyDef,
    context: unknown,
  ): context is CwKanbanEmptyContext {
    return true;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
