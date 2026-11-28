import { Component, model, type ModelSignal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckBold } from '@ng-icons/phosphor-icons/bold';

import { CwMenuItemBase } from '../menu-item-base/menu-item-base.directive';
import { CW_MENU_ITEM } from '../menu.token';

/**
 * Component CwMenuItemCheckbox
 *
 * @description
 * A display option ticked in a `cw-menu`: Sous-tâches, Étiquettes, Tâches terminées (DropdownMenu sheet of the Design System artifact). Put it on a native `<button>` inside the menu. `[(checked)]` is a model; a click, Enter or Space toggles it and the menu stays open. Renders `role="menuitemcheckbox"` with `aria-checked` and, while ticked, the check on the right after its label (mockup `App.dc.html`, the assignees menu: `ml-auto`), like a radio item and a selected item, so a leading avatar or icon stays aligned. `disabled` keeps it listed, skipped by the arrows.
 */
@Component({
  selector: 'button[cwMenuItemCheckbox]',
  imports: [NgIcon],
  providers: [
    provideIcons({ phosphorCheckBold }),
    { provide: CW_MENU_ITEM, useExisting: CwMenuItemCheckbox },
    { provide: CwMenuItemBase, useExisting: CwMenuItemCheckbox },
  ],
  host: {
    role: 'menuitemcheckbox',
    '[attr.aria-checked]': 'checked()',
    '[attr.data-state]': 'checked() ? "checked" : "unchecked"',
    '(click)': 'toggle()',
  },
  templateUrl: './menu-item-checkbox.component.html',
})
export class CwMenuItemCheckbox extends CwMenuItemBase {
  // #region Properties
  /**
   * Property checked
   *
   * @description
   * Whether the option is ticked; `[(checked)]`.
   *
   * @type {ModelSignal<boolean>}
   * @readonly
   */
  public readonly checked: ModelSignal<boolean> = model(false);
  // #endregion

  // #region Methods
  /**
   * Method toggle
   *
   * @description
   * Toggles the checked state unless the item is disabled.
   */
  protected toggle(): void {
    if (this.isDisabled()) return;
    this.checked.set(!this.checked());
  }
  // #endregion
}
