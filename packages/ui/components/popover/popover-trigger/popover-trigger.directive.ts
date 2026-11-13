import { Directive, ElementRef, computed, effect, inject, input } from '@angular/core';

import type { CwPopover } from '../popover.component';

/**
 * Opens and closes a `cw-popover` from its host, usually an `outline` or `ghost` `cwButton` with a
 * visible name (Popover sheet of the Design System artifact).
 *
 * A click (Enter and Space on a button) toggles the panel and moves the focus into it. The host
 * carries `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` (while open) and
 * `data-state="open|closed"`; while open it takes the selected veil (`bg-selected`).
 */
@Directive({
  selector: '[cwPopoverTrigger]',
  host: {
    // The open trigger looks selected; the data variant outranks the background of any button
    // variant (`bg-transparent` of `outline`).
    class: 'data-[state=open]:bg-selected',
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'expanded()',
    '[attr.aria-controls]': 'expanded() ? cwPopoverTrigger().panelId : null',
    '[attr.data-state]': 'expanded() ? "open" : "closed"',
    '(click)': 'toggle()',
  },
})
export class CwPopoverTrigger {
  /** The panel this element opens. */
  readonly cwPopoverTrigger = input.required<CwPopover>();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly expanded = computed(() => this.cwPopoverTrigger().isOpenFrom(this.element));

  constructor() {
    effect((onCleanup) => {
      onCleanup(this.cwPopoverTrigger().registerTrigger(this.element));
    });
  }

  protected toggle(): void {
    this.cwPopoverTrigger().toggle(this.element);
  }
}
