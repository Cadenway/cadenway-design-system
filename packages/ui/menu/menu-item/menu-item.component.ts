import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretRightBold, phosphorCheckBold } from '@ng-icons/phosphor-icons/bold';

import { CwMenuItemBase } from '../menu-item-base/menu-item-base.directive';
import { CW_MENU_ITEM } from '../menu.token';
import type { CwMenuItemVariant } from '../menu.types';

/* Leading icons are muted; a destructive item is red, icon included (sheet, "États"). */
const VARIANTS: Record<CwMenuItemVariant, string> = {
  default: '[&>ng-icon]:text-muted-foreground',
  destructive: 'text-destructive',
};

/**
 * An action of a `cw-menu`: Renommer, Dupliquer, Supprimer (DropdownMenu sheet of the Design System
 * artifact). Put it on a native `<button>` inside the menu.
 *
 * Projected content: a leading `ng-icon` (muted), the label (an infinitive), then an optional
 * `cw-menu-shortcut`. A click, Enter or Space emits `triggered` and closes every menu, the focus
 * going back to the trigger. With `[cwMenuTriggerFor]` on it, the item opens a submenu instead
 * (click, →, or 100 ms of hover) and shows a chevron. `variant="destructive"` for the destructive
 * action, last, after a separator. `inset` aligns the label with checkbox and radio items.
 * `selected` marks the current choice with a check on the right (`aria-current`), like the list a
 * task already sits in under "Déplacer vers…". `disabled` keeps it listed, skipped by the arrows.
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and activation keys. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
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
  /** `destructive`: red text and icon, for the destructive action. */
  readonly variant = input<CwMenuItemVariant>('default');
  /** Left padding of a checkbox or radio item, to align with them. */
  readonly inset = input(false, { transform: booleanAttribute });
  /** The current choice among the items: a check on the right. */
  readonly selected = input(false, { transform: booleanAttribute });
  /** Emitted when the item is activated (click, Enter, Space); every menu then closes. */
  readonly triggered = output();

  protected readonly variantClasses = computed(() => VARIANTS[this.variant()]);

  protected activate(): void {
    // A submenu item opens its submenu (`[cwMenuTriggerFor]` handles the click).
    if (this.hasSubmenu() || this.isDisabled()) return;
    this.triggered.emit();
    this.menu?.ɵcloseAll();
  }
}
