import { Directive, ElementRef, computed, inject, input } from '@angular/core';

import { CwMenuItemBase } from '../menu-item-base/menu-item-base.directive';
import { CwMenu } from '../menu.component';

/**
 * Opens a `cw-menu`: from a button (`…`, « Affichage », the account avatar), or from a menu item,
 * which then opens a submenu (DropdownMenu sheet of the Design System artifact).
 *
 * On a button: a click toggles the menu; Enter, Space and ↓ open it on its first item, ↑ on its
 * last. The panel is placed by the menu's `side` and `align`. On a `button[cwMenuItem]`: a click,
 * → or 100 ms of hover open the submenu on the right of the item. Sets `aria-haspopup="menu"`,
 * `aria-expanded`, `aria-controls` while open and `data-state="open|closed"`; the trigger turns
 * `bg-selected` while its menu is open.
 */
@Directive({
  selector: '[cwMenuTriggerFor]',
  host: {
    class: 'aria-expanded:bg-selected',
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'expanded()',
    '[attr.aria-controls]': 'expanded() ? cwMenuTriggerFor().panelId : null',
    '[attr.data-state]': 'expanded() ? "open" : "closed"',
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class CwMenuTriggerFor {
  /** The menu to open. */
  readonly cwMenuTriggerFor = input.required<CwMenu>();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /* Set when the trigger sits on a menu item: it opens a submenu. */
  private readonly item = inject(CwMenuItemBase, { self: true, optional: true });

  protected readonly expanded = computed(() => this.cwMenuTriggerFor().openedBy() === this.element);

  constructor() {
    this.item?.ɵsubmenuSource.set(() => this.cwMenuTriggerFor());
  }

  protected onClick(event: MouseEvent): void {
    // A click from the keyboard (Enter, Space) has no pointer detail: it lands on the first item.
    const fromKeyboard = event.detail === 0;
    if (this.item) {
      this.item.menu?.ɵopenSubmenu(this.item, fromKeyboard ? 'first' : 'none');
      return;
    }
    const menu = this.cwMenuTriggerFor();
    if (this.expanded()) {
      menu.ɵclose('trigger');
      return;
    }
    menu.open({
      origin: this.element,
      trigger: this.element,
      focus: fromKeyboard ? 'first' : 'panel',
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.item || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
    event.preventDefault();
    this.cwMenuTriggerFor().open({
      origin: this.element,
      trigger: this.element,
      focus: event.key === 'ArrowDown' ? 'first' : 'last',
    });
  }
}
