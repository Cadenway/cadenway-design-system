import { Component, computed, inject, input } from '@angular/core';

import { CwMenuItemBase } from '../menu-item-base/menu-item-base.directive';
import { CwMenuRadioGroup } from '../menu-radio-group/menu-radio-group.component';
import { CW_MENU_ITEM } from '../menu.token';

/**
 * One exclusive choice of a `cw-menu-radio-group`: Statut, Assigné, Priorité under « Grouper par »
 * (DropdownMenu sheet of the Design System artifact). Put it on a native `<button>` inside the group.
 *
 * `value` is required; a click, Enter or Space sets the group's value to it and the menu stays
 * open. Renders `role="menuitemradio"` with `aria-checked`, a dot in a 16 px slot on the left
 * (`pl-8`). `disabled` keeps it listed, skipped by the arrows.
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and activation keys. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[cwMenuItemRadio]',
  providers: [
    { provide: CW_MENU_ITEM, useExisting: CwMenuItemRadio },
    { provide: CwMenuItemBase, useExisting: CwMenuItemRadio },
  ],
  host: {
    role: 'menuitemradio',
    class: 'pl-8',
    '[attr.aria-checked]': 'checked()',
    '[attr.data-state]': 'checked() ? "checked" : "unchecked"',
    '(click)': 'choose()',
  },
  templateUrl: './menu-item-radio.component.html',
})
export class CwMenuItemRadio extends CwMenuItemBase {
  /** The value the group takes when this choice is made. */
  readonly value = input.required<string>();

  private readonly group = inject(CwMenuRadioGroup, { optional: true });

  /** Whether this is the group's current choice. */
  readonly checked = computed(() => this.group?.value() === this.value());

  protected choose(): void {
    if (this.isDisabled()) return;
    this.group?.value.set(this.value());
  }
}
