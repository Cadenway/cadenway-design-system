import {
  booleanAttribute,
  Component,
  computed,
  input,
  output,
  type InputSignalWithTransform,
  type InputSignal,
  type OutputEmitterRef,
  type Signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretRightBold, phosphorCheckBold } from '@ng-icons/phosphor-icons/bold';

import { CwMenuItemBase } from '../menu-item-base/menu-item-base.directive';
import { CW_MENU_ITEM } from '../menu.token';
import type { CwMenuItemVariant } from '../menu.types';

/* Leading icons are muted; a destructive item is red, icon included (sheet, "États"). */
/**
 * Constant VARIANTS
 *
 * @description
 * Item text and icon classes by variant.
 *
 * @type {Record<CwMenuItemVariant, string>}
 */
const VARIANTS: Record<CwMenuItemVariant, string> = {
  default: '[&>ng-icon]:text-muted-foreground',
  destructive: 'text-destructive',
};

/**
 * Component CwMenuItem
 *
 * @description
 * An action of a `cw-menu`: Renommer, Dupliquer, Supprimer (DropdownMenu sheet of the Design System artifact). Put it on a native `<button>` inside the menu. Projected content: a leading `ng-icon` (muted), the label (an infinitive), then an optional `cw-menu-shortcut`. A click, Enter or Space emits `triggered` and closes every menu, the focus going back to the trigger. With `[cwMenuTriggerFor]` on it, the item opens a submenu instead (click, →, or 100 ms of hover) and shows a chevron. `variant="destructive"` for the destructive action, last, after a separator. `inset` aligns the label with checkbox and radio items. `selected` marks the current choice with a check on the right (`aria-current`), like the list a task already sits in under "Déplacer vers…". `disabled` keeps it listed, skipped by the arrows.
 */
@Component({
  selector: 'button[cwMenuItem]',
  imports: [NgIcon],
  providers: [
    provideIcons({ phosphorCaretRightBold, phosphorCheckBold }),
    { provide: CW_MENU_ITEM, useExisting: CwMenuItem },
    { provide: CwMenuItemBase, useExisting: CwMenuItem },
  ],
  host: {
    role: 'menuitem',
    '[class]': 'variantClasses()',
    '[class.pl-8]': 'inset()',
    '[attr.data-variant]': 'variant()',
    '[attr.aria-current]': 'selected() ? "true" : null',
    '(click)': 'activate()',
  },
  templateUrl: './menu-item.component.html',
})
export class CwMenuItem extends CwMenuItemBase {
  // #region Properties
  /**
   * Property variant
   *
   * @description
   * `destructive`: red text and icon, for the destructive action.
   *
   * @type {InputSignal<CwMenuItemVariant>}
   * @readonly
   */
  public readonly variant: InputSignal<CwMenuItemVariant> = input<CwMenuItemVariant>('default');

  /**
   * Property inset
   *
   * @description
   * Left padding of a checkbox or radio item, to align with them.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly inset: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property selected
   *
   * @description
   * The current choice among the items: a check on the right.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly selected: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property triggered
   *
   * @description
   * Emitted when the item is activated (click, Enter, Space); every menu then closes.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly triggered: OutputEmitterRef<void> = output();

  /**
   * Property variantClasses
   *
   * @description
   * Classes corresponding to the item variant.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly variantClasses: Signal<string> = computed(() => VARIANTS[this.variant()]);
  // #endregion

  // #region Methods
  /**
   * Method activate
   *
   * @description
   * Emits activation and closes the menu unless disabled or opening a submenu.
   */
  protected activate(): void {
    // A submenu item opens its submenu (`[cwMenuTriggerFor]` handles the click).
    if (this.hasSubmenu() || this.isDisabled()) return;
    this.triggered.emit();
    this.menu?.ɵcloseAll();
  }
  // #endregion
}
