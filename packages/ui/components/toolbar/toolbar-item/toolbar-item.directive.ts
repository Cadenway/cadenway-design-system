import {
  Directive,
  ElementRef,
  booleanAttribute,
  inject,
  input,
  signal,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
  type WritableSignal,
} from '@angular/core';

import { CW_TOOLBAR_ITEM, type ToolbarItemHandle } from '../toolbar.token';

/**
 * Class CwToolbarItem
 * @class CwToolbarItem
 *
 * @description
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
  // #region Properties
  /**
   * Property overflowLabel
   * @readonly
   *
   * @description
   * Optional text for the overflow menu entry.
   *
   * @type {InputSignal<string>}
   */
  public readonly overflowLabel: InputSignal<string> = input('');

  /**
   * Property overflowIcon
   * @readonly
   *
   * @description
   * Optional icon name for the overflow menu entry.
   *
   * @type {InputSignal<string | null>}
   */
  public readonly overflowIcon: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property isPinned
   * @readonly
   *
   * @description
   * Whether the control remains outside the overflow menu; the alias preserves the pinned input.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly isPinned: InputSignalWithTransform<boolean, unknown> = input(false, {
    alias: 'pinned',
    transform: booleanAttribute,
  });

  /**
   * Property element
   * @readonly
   *
   * @description
   * Native control participating in toolbar navigation.
   *
   * @type {HTMLElement}
   */
  public readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property hidden
   * @readonly
   *
   * @description
   * Whether the control has moved into overflow.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly hidden: WritableSignal<boolean> = signal(false);

  /**
   * Property overflowed
   * @readonly
   *
   * @description
   * Read-only overflow state.
   *
   * @type {Signal<boolean>}
   */
  public readonly overflowed: Signal<boolean> = this.hidden.asReadonly();

  /**
   * Property pinned
   *
   * @description
   * Whether the control must remain visible in the toolbar.
   *
   * @returns {boolean} Whether the control is pinned.
   */
  public get pinned(): boolean {
    return this.isPinned();
  }

  /**
   * Property disabled
   *
   * @description
   * Whether keyboard navigation should skip this control.
   *
   * @returns {boolean} Whether the control is disabled.
   */
  public get disabled(): boolean {
    return (
      this.hidden() ||
      this.element.matches(':disabled') ||
      this.element.getAttribute('aria-disabled') === 'true'
    );
  }
  // #endregion

  // #region Methods
  /**
   * Method setOverflowed
   * @method setOverflowed
   *
   * @description
   * Synchronously hides or shows the control for overflow measurement.
   *
   * @param {boolean} overflowed - Whether the control should be hidden for overflow.
   */
  public setOverflowed(overflowed: boolean): void {
    if (overflowed) {
      this.element.style.setProperty('display', 'none');
      this.element.setAttribute('data-overflowed', '');
    } else {
      this.element.style.removeProperty('display');
      this.element.removeAttribute('data-overflowed');
    }
    this.hidden.set(overflowed);
  }

  /**
   * Method menuLabel
   * @method menuLabel
   *
   * @description
   * Returns the menu label, falling back to the control name.
   *
   * @returns {string} Menu label or fallback control name.
   */
  public menuLabel(): string {
    return (
      this.overflowLabel() ||
      (this.element.getAttribute('aria-label') ?? this.element.textContent.trim())
    );
  }

  /**
   * Method menuIcon
   * @method menuIcon
   *
   * @description
   * Returns the optional overflow icon name.
   *
   * @returns {string | null} Overflow icon name, or null when absent.
   */
  public menuIcon(): string | null {
    return this.overflowIcon();
  }

  /**
   * Method activate
   * @method activate
   *
   * @description
   * Activates the underlying control.
   */
  public activate(): void {
    this.element.click();
  }

  /**
   * Method focus
   * @method focus
   *
   * @description
   * Moves focus to the underlying control.
   */
  public focus(): void {
    this.element.focus();
  }

  /**
   * Method getLabel
   * @method getLabel
   *
   * @description
   * Returns the control label for keyboard navigation.
   *
   * @returns {string} Control label used for keyboard navigation.
   */
  public getLabel(): string {
    return this.menuLabel();
  }
  // #endregion
}
