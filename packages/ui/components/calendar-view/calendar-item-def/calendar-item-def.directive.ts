import { Directive, TemplateRef, inject, input } from '@angular/core';

import type { CwCalendarItemContext } from '../calendar-view.types';

/**
 * The content of each item of a `cw-calendar-view`:
 * `<ng-template cwCalendarItem let-item let-view="view">`, usually the status icon and the name.
 *
 * The calendar draws the frame (pill, bar, block, popover row), its states (hover veil, focus ring,
 * lifted preview) and, in the week view, the hours under the content; the template draws the
 * content, which must keep a visible name (truncated, the frame carries a `title`). It receives the
 * item, `view` (`month`, `bar`, `week` or `list`) and `span`. Without it, an item shows its
 * `itemLabel`. Bind `[cwCalendarItemOf]` to the calendar's items to type `let-item` in strict
 * templates.
 */
@Directive({ selector: 'ng-template[cwCalendarItem]' })
export class CwCalendarItemDef<T = unknown> {
  /** The calendar's items, only read by the template type checker to type the context. */
  readonly cwCalendarItemOf = input<readonly T[] | undefined>(undefined);

  /** The template, read by the calendar. */
  readonly template = inject<TemplateRef<CwCalendarItemContext<T>>>(TemplateRef);

  /** Types the template context for the template type checker. */
  // The compiler reads the signature only: the parameters exist for their types.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static ngTemplateContextGuard<T>(
    _directive: CwCalendarItemDef<T>,
    context: unknown,
  ): context is CwCalendarItemContext<T> {
    return true;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
