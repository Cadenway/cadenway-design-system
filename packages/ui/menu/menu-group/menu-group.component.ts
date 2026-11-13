import { ChangeDetectionStrategy, Component, contentChild } from '@angular/core';

import { CwMenuLabel } from '../menu-label/menu-label.component';

/**
 * A named part of a `cw-menu`, such as the « Afficher » checkboxes (DropdownMenu sheet of the Design
 * System artifact): a `cw-menu-label` followed by items.
 *
 * Renders `role="group"`, named by its `cw-menu-label`. Separate groups with `cw-menu-separator`.
 */
@Component({
  selector: 'cw-menu-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    class: 'block',
    '[attr.aria-labelledby]': 'label()?.id ?? null',
  },
  templateUrl: './menu-group.component.html',
})
export class CwMenuGroup {
  protected readonly label = contentChild(CwMenuLabel);
}
