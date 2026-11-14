import {
  Directive,
  ElementRef,
  computed,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';

import { CwMenuItemBase } from '../menu-item-base/menu-item-base.directive';
import { CwMenu } from '../menu.component';

/**
 * Directive CwMenuTriggerFor
 *
 * @description
 * Opens a `cw-menu`: from a button (`…`, « Affichage », the account avatar), or from a menu item, which then opens a submenu (DropdownMenu sheet of the Design System artifact). On a button: a click toggles the menu; Enter, Space and ↓ open it on its first item, ↑ on its last. The panel is placed by the menu's `side` and `align`. On a `button[cwMenuItem]`: a click, → or 100 ms of hover open the submenu on the right of the item. Sets `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` while open and `data-state="open|closed"`; the trigger turns `bg-selected` while its menu is open.
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
  // #region Properties
  /**
   * Property cwMenuTriggerFor
   *
   * @description
   * The menu to open.
   *
   * @type {InputSignal<CwMenu>}
   * @readonly
   */
  public readonly cwMenuTriggerFor: InputSignal<CwMenu> = input.required<CwMenu>();

  /**
   * Property element
   *
   * @description
   * Native trigger element used as the menu origin.
   *
   * @type {HTMLElement}
   * @readonly
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property item
   *
   * @description
   * Menu item hosting the trigger, or null for a root trigger.
   *
   * @type {CwMenuItemBase | null}
   * @readonly
   */
  private readonly item: CwMenuItemBase | null = inject(CwMenuItemBase, {
    self: true,
    optional: true,
  });

  /**
   * Property expanded
   *
   * @description
   * Whether the menu was opened by this trigger.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly expanded: Signal<boolean> = computed(
    () => this.cwMenuTriggerFor().openedBy() === this.element,
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Connects the submenu trigger to its containing item.
   *
   * @constructor
   */
  public constructor() {
    this.item?.ɵsubmenuSource.set(() => this.cwMenuTriggerFor());
  }
  // #endregion

  // #region Methods
  /**
   * Method onClick
   *
   * @description
   * Opens or toggles the menu according to the activation source.
   *
   * @param {MouseEvent} event - Browser event associated with the interaction.
   */
  protected onClick(event: MouseEvent): void {
    // A click from the keyboard (Enter, Space) has no pointer detail: it lands on the first item.
    const fromKeyboard: boolean = event.detail === 0;
    if (this.item) {
      this.item.menu?.ɵopenSubmenu(this.item, fromKeyboard ? 'first' : 'none');
      return;
    }
    const menu: CwMenu = this.cwMenuTriggerFor();
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

  /**
   * Method onKeydown
   *
   * @description
   * Opens the root menu on the first or last item for arrow keys.
   *
   * @param {KeyboardEvent} event - Browser event associated with the interaction.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.item || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
    event.preventDefault();
    this.cwMenuTriggerFor().open({
      origin: this.element,
      trigger: this.element,
      focus: event.key === 'ArrowDown' ? 'first' : 'last',
    });
  }
  // #endregion
}
