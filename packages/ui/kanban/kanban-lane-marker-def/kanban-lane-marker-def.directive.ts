import { Directive, TemplateRef, inject } from '@angular/core';

import type { CwKanbanLaneMarkerContext } from '../kanban.types';

/**
 * The marker drawn before a swimlane's label in a `cw-kanban`:
 * `<ng-template cwKanbanLaneMarker let-lane>`, priority bars or an `xs` avatar (Kanban sheet,
 * "Variantes"). It receives the lane; without it, the header shows the label alone.
 */
@Directive({ selector: 'ng-template[cwKanbanLaneMarker]' })
export class CwKanbanLaneMarkerDef {
  /** The template, read by the board. */
  readonly template = inject<TemplateRef<CwKanbanLaneMarkerContext>>(TemplateRef);

  /** Types the template context for the template type checker. */
  // The compiler reads the signature only: the parameters exist for their types.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static ngTemplateContextGuard(
    _directive: CwKanbanLaneMarkerDef,
    context: unknown,
  ): context is CwKanbanLaneMarkerContext {
    return true;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
