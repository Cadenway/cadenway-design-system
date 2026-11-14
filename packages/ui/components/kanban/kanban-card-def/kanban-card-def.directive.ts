import { Directive, TemplateRef, inject, input, type InputSignal } from '@angular/core';

import type { CwKanbanCardContext } from '../kanban.types';

/**
 * Directive CwKanbanCardDef
 *
 * @description
 * The content of each card of a `cw-kanban`: `<ng-template cwKanbanCard let-item let-density="density">`. The board draws the card's frame and states (rest, hover veil, focus ring, selected veil, lifted preview, dimmed) and puts this template inside; the template draws the fields (identifier, priority, name, labels, due date, assignees). It receives the item, the `density` and the `selected` and `grabbed` states. Without it, a card shows the item's `itemLabel`. Bind `[cwKanbanCardOf]` to the board's items to type `let-item` in strict templates.
 */
@Directive({ selector: 'ng-template[cwKanbanCard]' })
export class CwKanbanCardDef<T = unknown> {
  // #region Properties
  /**
   * Property cwKanbanCardOf
   *
   * @description
   * The board's items, only read by the template type checker to type the context.
   *
   * @type {InputSignal<readonly T[] | undefined>}
   * @readonly
   */
  public readonly cwKanbanCardOf: InputSignal<readonly T[] | undefined> = input<
    readonly T[] | undefined
  >(undefined);

  /**
   * Property template
   *
   * @description
   * The template, read by the board.
   *
   * @type {TemplateRef<CwKanbanCardContext<T>>}
   * @readonly
   */
  public readonly template: TemplateRef<CwKanbanCardContext<T>> =
    inject<TemplateRef<CwKanbanCardContext<T>>>(TemplateRef);
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Types the template context for the template type checker.
   *
   * @param {CwKanbanCardDef<T>} _directive - Directive instance used by the template checker.
   * @param {unknown} _context - Unknown template context to narrow.
   * @returns {context is CwKanbanCardContext<T>} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard<T>(
    _directive: CwKanbanCardDef<T>,
    _context: unknown,
  ): _context is CwKanbanCardContext<T> {
    return true;
  }
  // #endregion
}
