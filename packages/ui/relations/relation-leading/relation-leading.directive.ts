import { Directive, TemplateRef, inject } from '@angular/core';

import type { CwRelationLeadingContext } from '../relations.types';

/**
 * The consumer's glyph at the start of each relation row and picker result: the status icon of a
 * task, named (`role="img"`), for instance (Relations sheet of the Design System artifact). Put it
 * on an `ng-template` inside `cw-relations` or `cw-relation-picker`; `let-item` is the
 * `CwRelationItem`.
 */
@Directive({
  selector: 'ng-template[cwRelationLeading]',
})
export class CwRelationLeading {
  /** @internal */
  readonly template = inject<TemplateRef<CwRelationLeadingContext>>(TemplateRef);

  /** Types the `let-` variable of the template for the compiler. */
  // The compiler reads the signature only: the parameters exist for their types.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static ngTemplateContextGuard(
    _directive: CwRelationLeading,
    context: unknown,
  ): context is CwRelationLeadingContext {
    return true;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
