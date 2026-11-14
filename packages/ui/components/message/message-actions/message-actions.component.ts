import { Component, ElementRef, inject, input, type InputSignal } from '@angular/core';
import { FocusKeyManager, type FocusableOption } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { ɵnavigateList } from '@cadenway/ui/core';

/**
 * Component CwMessageActions
 *
 * @description
 * The action bar next to a bubble: React, Reply, More (Message sheet of the Design System artifact,
 * « Barre d'actions »).
 *
 * A `role="toolbar"` named « Actions du message », hidden by opacity only (so the keyboard still
 * reaches it) until the row is hovered or holds the focus. Left and right arrows, Home and End move
 * between its buttons. Projected into a `cw-message` with your own `button[cwButton]`s, it replaces
 * the default bar.
 */
@Component({
  selector: 'cw-message-actions',
  host: {
    role: 'toolbar',
    class:
      'flex shrink-0 items-center gap-px rounded-lg border bg-popover p-0.5 opacity-0 transition-opacity duration-150 group-hover/row:opacity-100 group-focus-within/row:opacity-100 motion-reduce:transition-none',
    '[attr.aria-label]': 'ariaLabel()',
    '(keydown)': 'navigate($event)',
  },
  templateUrl: './message-actions.component.html',
})
export class CwMessageActions {
  // #region Properties
  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name of the action bar.
   *
   * @type {InputSignal<string>}
   * @default 'Actions du message'
   */
  public readonly ariaLabel: InputSignal<string> = input('Actions du message');

  /**
   * Property host
   * @readonly
   *
   * @description
   * Toolbar element containing the projected action controls.
   *
   * @type {HTMLElement}
   */
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property dir
   * @readonly
   *
   * @description
   * Optional text direction used to interpret horizontal arrow keys.
   *
   * @type {Directionality | null}
   */
  private readonly dir: Directionality | null = inject(Directionality, { optional: true });
  // #endregion

  // #region Methods
  /**
   * Method navigate
   *
   * @description
   * Moves focus through the current enabled actions with horizontal arrows, Home and End.
   *
   * @param {KeyboardEvent} event - Keyboard event received by the toolbar.
   */
  protected navigate(event: KeyboardEvent): void {
    const controls: HTMLElement[] = Array.from(
      this.host.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'),
    );
    const current: number = controls.findIndex((control) => control === event.target);
    if (current < 0) return;
    // The buttons are projected by the consumer or drawn by the message: read them from the DOM
    // at each key, wrapped as focusable options for the CDK manager.
    const options: FocusableOption[] = controls.map((control) => ({
      focus: () => {
        control.focus();
      },
    }));
    const manager: FocusKeyManager<FocusableOption> = new FocusKeyManager<FocusableOption>(
      options,
    ).withWrap();
    manager.updateActiveItem(current);
    if (ɵnavigateList(manager, event, 'horizontal', this.dir?.value === 'rtl')) {
      event.preventDefault();
    }
    manager.destroy();
  }
  // #endregion
}
