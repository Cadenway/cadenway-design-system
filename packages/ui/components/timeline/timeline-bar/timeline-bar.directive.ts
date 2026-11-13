import { Directive, inject, TemplateRef } from '@angular/core';

import type { CwTimelineBarContext } from '../timeline.types';

/**
 * Replaces the content of every bar of a `cw-timeline` (status icon, name and percentage by
 * default): `<ng-template cwTimelineBar let-item let-width="width">`.
 *
 * The template receives the item and the drawn width of its bar in pixels, so it can drop details
 * on narrow bars. The bar itself (color, progress line, handles, focus, accessible name) stays the
 * timeline's.
 */
@Directive({ selector: 'ng-template[cwTimelineBar]' })
export class CwTimelineBarDef {
  /** The template, read by `cw-timeline`. */
  readonly template = inject<TemplateRef<CwTimelineBarContext>>(TemplateRef);

  /** Types the template context for the template type checker; never called at run time. */
  /* eslint-disable @typescript-eslint/no-unused-vars -- the signature is Angular's contract. */
  static ngTemplateContextGuard(
    _directive: CwTimelineBarDef,
    context: unknown,
  ): context is CwTimelineBarContext {
    return true;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
