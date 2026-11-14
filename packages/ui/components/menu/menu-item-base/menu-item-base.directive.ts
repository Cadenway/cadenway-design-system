import { _IdGenerator } from '@angular/cdk/a11y';
import {
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
  type InputSignalWithTransform,
  type WritableSignal,
  type Signal,
} from '@angular/core';

import { CwMenu } from '../menu.component';
import type { MenuItemHandle } from '../menu.token';

/* Item of the DropdownMenu sheet (anatomy 2), 32 px: the pointer and the arrows share one highlight
   (`data-highlighted`), a submenu item whose panel is open stays selected (`aria-expanded`). Leading
   icons are `ng-icon`, 16 px. */
/**
 * Constant ITEM
 *
 * @description
 * Classes for menu items, focus, highlight and disabled states.
 *
 * @type {string}
 */
const ITEM: string =
  'relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm whitespace-nowrap outline-hidden select-none ' +
  'transition-colors motion-reduce:transition-none hover:bg-accent focus-visible:bg-selected data-highlighted:bg-selected aria-expanded:bg-selected ' +
  'data-disabled:pointer-events-none data-disabled:opacity-50 ' +
  '[&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem]';

/**
 * Directive CwMenuItemBase
 *
 * @description
 * What `button[cwMenuItem]`, `button[cwMenuItemCheckbox]` and `button[cwMenuItemRadio]` share: a `<button>` out of the tab order, its place in the menu's arrow navigation, the shared highlight, the disabled state and the hover that opens a submenu. Not exported from the entry point: the three items extend it, so their inputs stay declared on their own classes. A disabled item keeps `aria-disabled` (screen readers still list it), is skipped by the arrows and the typeahead and swallows clicks before the consumer's own `(click)` listener.
 */
@Directive({
  host: {
    type: 'button',
    tabindex: '-1',
    class: ITEM,
    '[attr.id]': 'id',
    '[attr.disabled]': 'null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.data-highlighted]': 'highlighted() ? "" : null',
    '(pointerenter)': 'onPointerEnter($event)',
    '(pointerleave)': 'onPointerLeave()',
    '(focus)': 'onFocus()',
  },
})
export abstract class CwMenuItemBase implements MenuItemHandle {
  // #region Properties
  /**
   * Property isDisabled
   *
   * @description
   * Disables the item: skipped by the arrows, not clickable, `aria-disabled`.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly isDisabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });

  /**
   * Property element
   *
   * @description
   * The item's `<button>`.
   *
   * @type {HTMLElement}
   * @readonly
   */
  public readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property menu
   *
   * @description
   * The menu the item belongs to.
   *
   * @type {CwMenu | null}
   * @readonly
   */
  public readonly menu: CwMenu | null = inject(CwMenu, { optional: true });

  /**
   * Property id
   *
   * @description
   * Id of the item; a submenu panel is named by it.
   *
   * @type {string}
   * @readonly
   */
  protected readonly id: string = inject(_IdGenerator).getId('cw-menu-item-');

  /**
   * Property highlighted
   *
   * @description
   * Whether this item is active in its menu.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly highlighted: Signal<boolean> = computed(() => this.menu?.ɵactive() === this);

  /**
   * Property ɵsubmenuSource
   *
   * @description
   * Set by `[cwMenuTriggerFor]` when it sits on the item. Not public API.
   *
   * @type {WritableSignal<(() => CwMenu) | null>}
   * @readonly
   */
  public readonly ɵsubmenuSource: WritableSignal<(() => CwMenu) | null> = signal<
    (() => CwMenu) | null
  >(null);

  /**
   * Property hasSubmenu
   *
   * @description
   * Whether this item opens a submenu.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly hasSubmenu: Signal<boolean> = computed(() => this.ɵsubmenuSource() !== null);
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Guards disabled item clicks before consumer listeners run.
   *
   * @constructor
   */
  public constructor() {
    // Capture phase: the guard runs before the consumer's own (click) listener on the element.
    this.element.addEventListener(
      'click',
      (event) => {
        if (this.isDisabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true },
    );
  }
  // #endregion

  // #region Properties
  /**
   * Property disabled
   *
   * @description
   * Read by the CDK key manager, which skips disabled items.
   * @returns {boolean} Whether the item is disabled.
   */
  public get disabled(): boolean {
    return this.isDisabled();
  }
  // #endregion

  // #region Methods
  /**
   * Method submenu
   *
   * @description
   * Returns the submenu associated with this item.
   * @returns {CwMenu | null} Submenu associated with the item, or null when absent.
   */
  public submenu(): CwMenu | null {
    return this.ɵsubmenuSource()?.() ?? null;
  }

  /**
   * Method focus
   *
   * @description
   * Focuses the item button.
   */
  public focus(): void {
    this.element.focus();
  }

  /**
   * Method getLabel
   *
   * @description
   * Reads the button text for typeahead navigation.
   * @returns {string} Trimmed item text used by typeahead.
   */
  public getLabel(): string {
    return this.element.textContent.trim();
  }

  /**
   * Method onFocus
   *
   * @description
   * Synchronizes the containing menu when the item receives focus.
   */
  protected onFocus(): void {
    this.menu?.ɵfocused(this);
  }

  /**
   * Method onPointerLeave
   *
   * @description
   * Cancels submenu hover behavior when the pointer leaves.
   */
  protected onPointerLeave(): void {
    this.menu?.ɵunhover();
  }

  /**
   * Method onPointerEnter
   *
   * @description
   * Notifies the menu of pointer hover except for touch.
   *
   * @param {PointerEvent} event - Pointer event from the menu item.
   */
  protected onPointerEnter(event: PointerEvent): void {
    // A touch has no hover: the tap opens the submenu through the click.
    if (event.pointerType !== 'touch') this.menu?.ɵhover(this);
  }
  // #endregion
}
