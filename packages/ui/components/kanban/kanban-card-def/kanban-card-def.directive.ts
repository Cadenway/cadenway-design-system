import { Directive, TemplateRef, inject, input } from '@angular/core';

import type { CwKanbanCardContext } from '../kanban.types';

/**
 * The content of each card of a `cw-kanban`: `<ng-template cwKanbanCard let-item let-density="density">`.
 *
 * The board draws the card's frame and states (rest, hover veil, focus ring, selected veil, lifted
 * preview, dimmed) and puts this template inside; the template draws the fields (identifier,
 * priority, name, labels, due date, assignees). It receives the item, the `density` and the
 * `selected` and `grabbed` states. Without it, a card shows the item's `itemLabel`. Bind
 * `[cwKanbanCardOf]` to the board's items to type `let-item` in strict templates.
 */
@Directive({ selector: 'ng-template[cwKanbanCard]' })
export class CwKanbanCardDef<T = unknown> {
  /** The board's items, only read by the template type checker to type the context. */
  readonly cwKanbanCardOf = input<readonly T[] | undefined>(undefined);

  /** The template, read by the board. */
  readonly template = inject<TemplateRef<CwKanbanCardContext<T>>>(TemplateRef);

  /** Types the template context for the template type checker. */
  // The compiler reads the signature only: the parameters exist for their types.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static ngTemplateContextGuard<T>(
    _directive: CwKanbanCardDef<T>,
    context: unknown,
  ): context is CwKanbanCardContext<T> {
    return true;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
