import { Directive, inject, TemplateRef } from '@angular/core';

import type { CwTimelineBarContext } from '../timeline.types';

/**
 * Class CwTimelineBarDef
 * @class CwTimelineBarDef
 *
 * @description
 * Replaces the content of every bar of a `cw-timeline` (status icon, name and percentage by
 * default): `<ng-template cwTimelineBar let-item let-width="width">`.
 *
 * The template receives the item and the drawn width of its bar in pixels, so it can drop details
 * on narrow bars. The bar itself (color, progress line, handles, focus, accessible name) stays the
 * timeline's.
 */
@Directive({ selector: 'ng-template[cwTimelineBar]' })
export class CwTimelineBarDef {
  // #region Properties
  /**
   * Property template
   * @readonly
   *
   * @description
   * Bar content template consumed by the timeline.
   *
   * @type {TemplateRef<CwTimelineBarContext>}
   */
  public readonly template: TemplateRef<CwTimelineBarContext> =
    inject<TemplateRef<CwTimelineBarContext>>(TemplateRef);
  // #endregion

  // #region Methods
  /**
   * Method ngTemplateContextGuard
   * @method ngTemplateContextGuard
   *
   * @description
   * Declares the template context type for Angular's template checker.
   *
   * @param {CwTimelineBarDef} _directive - Directive instance used by Angular's template checker.
   * @param {unknown} _context - Unknown template context to narrow.
   *
   * @returns {context is CwTimelineBarContext} Whether the context has the timeline bar shape.
   */
  public static ngTemplateContextGuard(
    _directive: CwTimelineBarDef,
    _context: unknown,
  ): _context is CwTimelineBarContext {
    return true;
  }
  // #endregion
}
