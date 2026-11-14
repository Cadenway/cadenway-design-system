import {
  Directive,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';

import type { CwPopover } from '../popover.component';

/**
 * Directive CwPopoverTrigger
 *
 * @description
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
  // #region Properties
  /**
   * Property cwPopoverTrigger
   * @readonly
   *
   * @description
   * Popover opened by this trigger.
   *
   * @type {InputSignal<CwPopover>}
   */
  public readonly cwPopoverTrigger: InputSignal<CwPopover> = input.required<CwPopover>();

  /**
   * Property element
   * @readonly
   *
   * @description
   * Host element anchoring the popover.
   *
   * @type {HTMLElement}
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property expanded
   * @readonly
   *
   * @description
   * Whether the popover is open from this trigger.
   *
   * @type {Signal<boolean>}
   */
  protected readonly expanded: Signal<boolean> = computed(() =>
    this.cwPopoverTrigger().isOpenFrom(this.element),
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Registers this trigger with the popover.
   */
  public constructor() {
    effect((onCleanup) => {
      onCleanup(this.cwPopoverTrigger().registerTrigger(this.element));
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method toggle
   *
   * @description
   * Toggles the popover from this trigger.
   */
  protected toggle(): void {
    this.cwPopoverTrigger().toggle(this.element);
  }
  // #endregion
}
