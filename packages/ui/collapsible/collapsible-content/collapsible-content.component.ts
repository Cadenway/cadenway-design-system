import { Component, inject } from '@angular/core';

import { CwCollapsible } from '../collapsible.component';

/* Collapsible sheet, "Mouvement": the rows of a grid go from 0fr to 1fr with a fade, 300 ms
   `ease-snap`, instant under reduced motion; never a height animated in JavaScript. The state is
   read on the content itself (not through a `group-data-*` of the root) so that nested blocks do
   not read their ancestors' state. */
const CONTENT =
  'grid transition-[grid-template-rows,opacity] duration-300 ease-snap motion-reduce:transition-none ' +
  'data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0 data-[state=open]:grid-rows-[1fr]';

/**
 * The part of a `cw-collapsible` that folds (Collapsible sheet of the Design System artifact).
 *
 * It is referenced by the trigger's `aria-controls`; closed, it is `inert` (out of the tab order
 * and of the accessibility tree) and its rows shrink to zero. Content stays rendered while closed.
 */
@Component({
  selector: 'cw-collapsible-content',
  host: {
    class: CONTENT,
    '[id]': 'collapsible.contentId',
    '[attr.data-state]': 'collapsible.state()',
    '[attr.inert]': 'collapsible.expanded() ? null : ""',
  },
  templateUrl: './collapsible-content.component.html',
})
export class CwCollapsibleContent {
  protected readonly collapsible = inject(CwCollapsible);
}
