import { Directive, TemplateRef, inject } from '@angular/core';

import type { CwGroupContext } from '../data-table.types';

/**
 * What a group row shows between its chevron and its count: `<ng-template cwDataTableGroup
 * let-key let-label="label">` inside `cw-data-table` (a status icon and its label, a person). The
 * table knows no status: without this template the group row shows `groupLabel(key)`.
 */
@Directive({ selector: 'ng-template[cwDataTableGroup]' })
export class CwDataTableGroup {
  /** The template the table stamps in every group row. */
  readonly template = inject<TemplateRef<CwGroupContext>>(TemplateRef);

  /** Types the `let-` variables of the template for the compiler. */
  // The compiler reads the signature only: the parameters exist for their types.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static ngTemplateContextGuard(_dir: CwDataTableGroup, ctx: unknown): ctx is CwGroupContext {
    return true;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
