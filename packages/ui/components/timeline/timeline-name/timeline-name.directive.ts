import { DestroyRef, Directive, inject, TemplateRef } from '@angular/core';

import { CwTimeline } from '../timeline.component';

import type { CwTimelineNameContext } from '../timeline.types';

/**
 * Class CwTimelineNameDef
 * @class CwTimelineNameDef
 *
 * @description
 * Replaces the content of the name cell of every item row of a `cw-timeline` (status icon, name,
 * then « Sans date » or the assignee by default): `<ng-template cwTimelineName let-item
 * let-dates="dates">`, for example the status, the name and the key of a task (mockup
 * `App.dc.html`, Gantt).
 *
 * The template receives the item, its dates as drawn (null when undated) and the row level. The
 * cell itself (indent, sticky column, focus, duration with `showDuration`) stays the timeline's;
 * the template draws text, not interactive controls, since the row is the keyboard target. It
 * registers with the enclosing timeline, so it must be a direct child of `cw-timeline`'s content.
 */
@Directive({ selector: 'ng-template[cwTimelineName]' })
export class CwTimelineNameDef {
  // #region Properties
  /**
   * Property template
   * @readonly
   *
   * @description
   * Name cell template consumed by the timeline.
   *
   * @type {TemplateRef<CwTimelineNameContext>}
   */
  public readonly template: TemplateRef<CwTimelineNameContext> =
    inject<TemplateRef<CwTimelineNameContext>>(TemplateRef);
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Registers the template with the enclosing timeline, and clears it when the slot is destroyed.
   */
  public constructor() {
    const timeline: CwTimeline | null = inject(CwTimeline, { optional: true });
    timeline?.registerNameTemplate(this.template);
    inject(DestroyRef).onDestroy(() => {
      timeline?.registerNameTemplate(undefined);
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   * @method ngTemplateContextGuard
   *
   * @description
   * Declares the template context type for Angular's template checker.
   *
   * @param {CwTimelineNameDef} _directive - Directive instance used by Angular's template checker.
   * @param {unknown} _context - Unknown template context to narrow.
   *
   * @returns {context is CwTimelineNameContext} Whether the context has the timeline name shape.
   */
  public static ngTemplateContextGuard(
    _directive: CwTimelineNameDef,
    _context: unknown,
  ): _context is CwTimelineNameContext {
    return true;
  }
  // #endregion
}
