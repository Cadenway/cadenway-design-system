import { Directive, TemplateRef, inject, input, type InputSignal } from '@angular/core';

import type { CwCalendarItemContext } from '../calendar-view.types';

/**
 * Directive CwCalendarItemDef
 *
 * @description
 * The content of each item of a `cw-calendar-view`: `<ng-template cwCalendarItem let-item let-view="view">`, usually the status icon and the name. The calendar draws the frame (pill, bar, block, popover row), its states (hover veil, focus ring, lifted preview) and, in the week view, the hours under the content; the template draws the content, which must keep a visible name (truncated, the frame carries a `title`). It receives the item, `view` (`month`, `bar`, `week` or `list`) and `span`. Without it, an item shows its `itemLabel`. Bind `[cwCalendarItemOf]` to the calendar's items to type `let-item` in strict templates.
 */
@Directive({ selector: 'ng-template[cwCalendarItem]' })
export class CwCalendarItemDef<T = unknown> {
  // #region Properties
  /**
   * Property cwCalendarItemOf
   *
   * @description
   * The calendar's items, only read by the template type checker to type the context.
   *
   * @type {InputSignal<readonly T[] | undefined>}
   * @readonly
   */
  public readonly cwCalendarItemOf: InputSignal<readonly T[] | undefined> = input<
    readonly T[] | undefined
  >(undefined);

  /**
   * Property template
   *
   * @description
   * The template, read by the calendar.
   *
   * @type {TemplateRef<CwCalendarItemContext<T>>}
   * @readonly
   */
  public readonly template: TemplateRef<CwCalendarItemContext<T>> =
    inject<TemplateRef<CwCalendarItemContext<T>>>(TemplateRef);
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   *
   * @description
   * Types the template context for the template type checker.
   *
   * @param {CwCalendarItemDef<T>} _directive - Directive instance used by the template checker.
   * @param {unknown} _context - Context of the item to open.
   * @returns {context is CwCalendarItemContext<T>} Whether the context has the declared template type.
   */
  public static ngTemplateContextGuard<T>(
    _directive: CwCalendarItemDef<T>,
    _context: unknown,
  ): _context is CwCalendarItemContext<T> {
    return true;
  }
  // #endregion
}
