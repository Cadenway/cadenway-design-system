import { Component, computed, inject, input, type InputSignal, type Signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckBold } from '@ng-icons/phosphor-icons/bold';

import { CwMenuItemBase } from '../menu-item-base/menu-item-base.directive';
import { CwMenuRadioGroup } from '../menu-radio-group/menu-radio-group.component';
import { CW_MENU_ITEM } from '../menu.token';

/**
 * Component CwMenuItemRadio
 *
 * @description
 * One exclusive choice of a `cw-menu-radio-group`: Statut, Assigné, Priorité under « Grouper par » (DropdownMenu sheet of the Design System artifact). Put it on a native `<button>` inside the group. `value` is required; a click, Enter or Space sets the group's value to it and the menu stays open. Renders `role="menuitemradio"` with `aria-checked` and, on the chosen item, the same check on the right as a `selected` `cwMenuItem` (mockup App.dc.html, the organization, status and theme choices), so a leading icon or dot stays aligned with the other items. `disabled` keeps it listed, skipped by the arrows.
 */
@Component({
  selector: 'button[cwMenuItemRadio]',
  imports: [NgIcon],
  providers: [
    provideIcons({ phosphorCheckBold }),
    { provide: CW_MENU_ITEM, useExisting: CwMenuItemRadio },
    { provide: CwMenuItemBase, useExisting: CwMenuItemRadio },
  ],
  host: {
    role: 'menuitemradio',
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
