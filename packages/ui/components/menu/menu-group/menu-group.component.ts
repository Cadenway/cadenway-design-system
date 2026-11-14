import { Component, contentChild, type Signal } from '@angular/core';

import { CwMenuLabel } from '../menu-label/menu-label.component';

/**
 * Component CwMenuGroup
 *
 * @description
 * A named part of a `cw-menu`, such as the « Afficher » checkboxes (DropdownMenu sheet of the Design System artifact): a `cw-menu-label` followed by items. Renders `role="group"`, named by its `cw-menu-label`. Separate groups with `cw-menu-separator`.
 */
@Component({
  selector: 'cw-menu-group',
  host: {
    role: 'group',
    class: 'block',
    '[attr.aria-labelledby]': 'label()?.id ?? null',
  },
  templateUrl: './menu-group.component.html',
})
export class CwMenuGroup {
  // #region Properties
  /**
   * Property label
   *
   * @description
   * Projected label naming the menu group.
   *
   * @type {Signal<CwMenuLabel | undefined>}
   * @readonly
   */
  protected readonly label: Signal<CwMenuLabel | undefined> = contentChild(CwMenuLabel);
  // #endregion
}
