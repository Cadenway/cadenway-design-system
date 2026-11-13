import { Component, contentChild, model } from '@angular/core';

import { CwMenuLabel } from '../menu-label/menu-label.component';

/**
 * A set of exclusive choices in a `cw-menu`, such as « Grouper par » (DropdownMenu sheet of the
 * Design System artifact): holds `button[cwMenuItemRadio]` items, usually after a `cw-menu-label`.
 *
 * `[(value)]` is a model: the value of the chosen radio; choosing keeps the menu open. Renders
 * `role="group"`, named by its `cw-menu-label` when it has one.
 */
@Component({
  selector: 'cw-menu-radio-group',
  host: {
    role: 'group',
    class: 'block',
    '[attr.aria-labelledby]': 'label()?.id ?? null',
  },
  templateUrl: './menu-radio-group.component.html',
})
export class CwMenuRadioGroup {
  /** The value of the chosen radio; `[(value)]`. */
  readonly value = model<string>();

  protected readonly label = contentChild(CwMenuLabel);
}
