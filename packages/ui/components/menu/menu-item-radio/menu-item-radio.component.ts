import { Component, computed, inject, input, type InputSignal, type Signal } from '@angular/core';

import { CwMenuItemBase } from '../menu-item-base/menu-item-base.directive';
import { CwMenuRadioGroup } from '../menu-radio-group/menu-radio-group.component';
import { CW_MENU_ITEM } from '../menu.token';

/**
 * Component CwMenuItemRadio
 *
 * @description
 * One exclusive choice of a `cw-menu-radio-group`: Statut, Assigné, Priorité under « Grouper par » (DropdownMenu sheet of the Design System artifact). Put it on a native `<button>` inside the group. `value` is required; a click, Enter or Space sets the group's value to it and the menu stays open. Renders `role="menuitemradio"` with `aria-checked`, a dot in a 16 px slot on the left (`pl-8`). `disabled` keeps it listed, skipped by the arrows.
 */
@Component({
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
  // #region Properties
  /**
   * Property value
   *
   * @description
   * The value the group takes when this choice is made.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly value: InputSignal<string> = input.required<string>();

  /**
   * Property group
   *
   * @description
   * Optional radio group containing the item.
   *
   * @type {CwMenuRadioGroup | null}
   * @readonly
   */
  private readonly group: CwMenuRadioGroup | null = inject(CwMenuRadioGroup, { optional: true });

  /**
   * Property checked
   *
   * @description
   * Whether this is the group's current choice.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  public readonly checked: Signal<boolean> = computed(() => this.group?.value() === this.value());
  // #endregion

  // #region Methods
  /**
   * Method choose
   *
   * @description
   * Selects this radio value unless the item is disabled.
   */
  protected choose(): void {
    if (this.isDisabled()) return;
    this.group?.value.set(this.value());
  }
  // #endregion
}
