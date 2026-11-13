import { Directive, ElementRef, booleanAttribute, inject, input, signal } from '@angular/core';

import { CW_TOOLBAR_ITEM, type ToolbarItemHandle } from '../toolbar.token';

/**
 * Makes a control of a `cw-toolbar` part of its arrow navigation and lets it move into the
 * « Plus » menu when the bar runs out of width (Toolbar sheet of the Design System artifact).
 *
 * Put it on each button of the bar (`button[cwButton]`), the primary action included. The bar
 * gives one Tab stop to all of them and moves between them with ← → (roving `tabindex`). When the
 * width is short, the items that are not `pinned` move one by one into the menu, from the last to
 * the first: the control is hidden (`data-overflowed`) and its entry in the menu shows
 * `overflowIcon` and `overflowLabel` (the control's `aria-label` or text by default); choosing the
 * entry clicks the hidden control. Pin the primary action and « Filtrer ». A disabled control
 * (`disabled` or `aria-disabled`) is skipped by the arrows.
 */
@Directive({
  selector: '[cwToolbarItem]',
  providers: [{ provide: CW_TOOLBAR_ITEM, useExisting: CwToolbarItem }],
})
export class CwToolbarItem implements ToolbarItemHandle {
  /** Text of the « Plus » menu entry; the control's `aria-label` or text by default. */
  readonly overflowLabel = input('');
  /** Leading icon of the « Plus » menu entry (an ng-icons name registered by the app). */
  readonly overflowIcon = input<string | null>(null);
  /** Never moves into the « Plus » menu (the primary action, « Filtrer »). */
  // The toolbar reads `pinned` as a boolean property (the getter below), so the input signal
  // takes another name and keeps the sheet's `pinned` attribute as its alias.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly isPinned = input(false, { alias: 'pinned', transform: booleanAttribute });

  /** The control. */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private readonly hidden = signal(false);
  /** Whether the control currently sits in the « Plus » menu. */
  readonly overflowed = this.hidden.asReadonly();

  /** Read by the toolbar's overflow measure. */
  get pinned(): boolean {
    return this.isPinned();
  }

  /** Read by the CDK key manager, which skips disabled items. */
  get disabled(): boolean {
    return (
      this.hidden() ||
      this.element.matches(':disabled') ||
      this.element.getAttribute('aria-disabled') === 'true'
    );
  }

  /** Hides or shows the control at once: the toolbar measures its width right after. */
  setOverflowed(overflowed: boolean): void {
    if (overflowed) {
      this.element.style.setProperty('display', 'none');
      this.element.setAttribute('data-overflowed', '');
    } else {
      this.element.style.removeProperty('display');
      this.element.removeAttribute('data-overflowed');
    }
    this.hidden.set(overflowed);
  }

  menuLabel(): string {
    return (
      this.overflowLabel() ||
      (this.element.getAttribute('aria-label') ?? this.element.textContent.trim())
    );
  }

  menuIcon(): string | null {
    return this.overflowIcon();
  }

  activate(): void {
    this.element.click();
  }

  focus(): void {
    this.element.focus();
  }

  getLabel(): string {
    return this.menuLabel();
  }
}
