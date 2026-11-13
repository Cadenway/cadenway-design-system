import { Directive, TemplateRef, inject, input } from '@angular/core';

import type { CwFilterValueContext } from '../filter-bar.types';

/**
 * Replaces the content of the value segment of the chips of one field (Filter Bar sheet:
 * `ng-template cwFilterValue`), for a value the default summary cannot show.
 *
 * `<ng-template cwFilterValue="due" let-filter let-field="field">…</ng-template>` inside
 * `cw-filter-bar` or a standalone `cw-filter-chip`; the value is the field's `key`. The segment
 * stays a button that opens the value editor: render text and decorative media only.
 */
@Directive({ selector: 'ng-template[cwFilterValue]' })
export class CwFilterValueDef {
  /** `key` of the field the template renders. */
  readonly cwFilterValue = input.required<string>();

  /** The template. Not public API. */
  readonly ɵtemplate = inject<TemplateRef<CwFilterValueContext>>(TemplateRef);

  /** Types `let-` variables of the template for the compiler. */
  // The compiler reads the signature only: the parameters exist for their types.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static ngTemplateContextGuard(_dir: CwFilterValueDef, ctx: unknown): ctx is CwFilterValueContext {
    return true;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
