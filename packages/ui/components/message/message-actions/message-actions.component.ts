import { Component, ElementRef, inject, input } from '@angular/core';
import { FocusKeyManager, type FocusableOption } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { ɵnavigateList } from '@cadenway/ui/core';

/**
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
  /** Accessible name of the bar. */
  readonly ariaLabel = input('Actions du message');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly dir = inject(Directionality, { optional: true });

  protected navigate(event: KeyboardEvent): void {
    const controls = Array.from(
      this.host.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'),
    );
    const current = controls.findIndex((control) => control === event.target);
    if (current < 0) return;
    // The buttons are projected by the consumer or drawn by the message: read them from the DOM
    // at each key, wrapped as focusable options for the CDK manager.
    const options: FocusableOption[] = controls.map((control) => ({
      focus: () => {
        control.focus();
      },
    }));
    const manager = new FocusKeyManager(options).withWrap();
    manager.updateActiveItem(current);
    if (ɵnavigateList(manager, event, 'horizontal', this.dir?.value === 'rtl')) {
      event.preventDefault();
    }
    manager.destroy();
  }
}
