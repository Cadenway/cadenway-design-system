import { Component, inject } from '@angular/core';

import { CwCollapsible } from '../collapsible.component';

/**
 * Constant CONTENT
 *
 * @description
 * Grid and fade classes for the Collapsible sheet's 300 ms entrance and exit. The content uses
 * its own state so nested blocks do not inherit an ancestor's animation state.
 *
 * @type {string}
 */
const CONTENT: string =
  'grid transition-[grid-template-rows,opacity] duration-300 ease-snap motion-reduce:transition-none ' +
  'data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0 data-[state=open]:grid-rows-[1fr]';

/**
 * Class CwCollapsibleContent
 * @class CwCollapsibleContent
 *
 * @description
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
  // #region Properties
  /**
   * Property collapsible
   * @readonly
   *
   * @description
   * Parent block providing the content identifier and expansion state.
   *
   * @type {CwCollapsible}
   */
  protected readonly collapsible: CwCollapsible = inject(CwCollapsible);
  // #endregion
}
