import { Directive, TemplateRef, inject, input } from '@angular/core';

import type { CwFilterOptionContext } from '../filter-bar.types';

/**
 * The leading media of the options of one field, in the values menu and in the value segment: a
 * status icon, an avatar (Filter Bar sheet, anatomy 2.3 and 6). It replaces the option's `icon`.
 *
 * `<ng-template cwFilterOption="status" let-option>…</ng-template>` inside `cw-filter-bar` or a
 * standalone `cw-filter-chip`; the value is the field's `key`. Render a 16 px decorative element:
 * the option's label is always written next to it.
 */
@Directive({ selector: 'ng-template[cwFilterOption]' })
export class CwFilterOptionDef {
  /** `key` of the field whose options the template renders. */
  readonly cwFilterOption = input.required<string>();

  /** The template. Not public API. */
  readonly ɵtemplate = inject<TemplateRef<CwFilterOptionContext>>(TemplateRef);

  /** Types `let-` variables of the template for the compiler. */
  // The compiler reads the signature only: the parameters exist for their types.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static ngTemplateContextGuard(
    _dir: CwFilterOptionDef,
    ctx: unknown,
  ): ctx is CwFilterOptionContext {
    return true;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
