import { _IdGenerator } from '@angular/cdk/a11y';
import {
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

import { CwMenu } from '../menu.component';
import type { MenuItemHandle } from '../menu.token';

/* Item of the DropdownMenu sheet (anatomy 2), 32 px: the pointer and the arrows share one highlight
   (`data-highlighted`), a submenu item whose panel is open stays selected (`aria-expanded`). Leading
   icons are `ng-icon`, 16 px. */
const ITEM =
  'relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm whitespace-nowrap outline-hidden select-none ' +
  'transition-colors motion-reduce:transition-none hover:bg-accent focus-visible:bg-selected data-highlighted:bg-selected aria-expanded:bg-selected ' +
  'data-disabled:pointer-events-none data-disabled:opacity-50 ' +
  '[&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem]';

/**
 * What `button[cwMenuItem]`, `button[cwMenuItemCheckbox]` and `button[cwMenuItemRadio]` share: a
 * `<button>` out of the tab order, its place in the menu's arrow navigation, the shared highlight,
 * the disabled state and the hover that opens a submenu. Not exported from the entry point: the
 * three items extend it, so their inputs stay declared on their own classes.
 *
 * A disabled item keeps `aria-disabled` (screen readers still list it), is skipped by the arrows
 * and the typeahead and swallows clicks before the consumer's own `(click)` listener.
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
  /** Disables the item: skipped by the arrows, not clickable, `aria-disabled`. */
  // The CDK key manager reads `disabled` as a boolean property (the getter below), so the input
  // signal takes another name and keeps the sheet's `disabled` attribute as its alias.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly isDisabled = input(false, { alias: 'disabled', transform: booleanAttribute });

  /** The item's `<button>`. */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** The menu the item belongs to. */
  readonly menu = inject(CwMenu, { optional: true });
  /** Id of the item; a submenu panel is named by it. */
  protected readonly id = inject(_IdGenerator).getId('cw-menu-item-');
  protected readonly highlighted = computed(() => this.menu?.ɵactive() === this);

  /** Set by `[cwMenuTriggerFor]` when it sits on the item. Not public API. */
  readonly ɵsubmenuSource = signal<(() => CwMenu) | null>(null);
  protected readonly hasSubmenu = computed(() => this.ɵsubmenuSource() !== null);

  constructor() {
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

  /** Read by the CDK key manager, which skips disabled items. */
  get disabled(): boolean {
    return this.isDisabled();
  }

  submenu(): CwMenu | null {
    return this.ɵsubmenuSource()?.() ?? null;
  }

  focus(): void {
    this.element.focus();
  }

  getLabel(): string {
    return this.element.textContent.trim();
  }

  protected onFocus(): void {
    this.menu?.ɵfocused(this);
  }

  protected onPointerLeave(): void {
    this.menu?.ɵunhover();
  }

  protected onPointerEnter(event: PointerEvent): void {
    // A touch has no hover: the tap opens the submenu through the click.
    if (event.pointerType !== 'touch') this.menu?.ɵhover(this);
  }
}
