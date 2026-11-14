import { Component, computed, input, type InputSignal, type Signal } from '@angular/core';

import type { CwPopoverAlign, CwPopoverSide } from '../popover.types';

/* Literal class strings (Popover sheet and preview of the Design System artifact). In light, a
   1.5 px shadow turned outwards continues the panel's `shadow-md`, in the contact shadow token; in
   dark, the elevation and the border are enough. */
/**
 * Constant BASE
 *
 * @description
 * Base classes for the popover arrow.
 *
 * @type {string}
 */
const BASE: string =
  'pointer-events-none absolute block size-2.5 rotate-45 rounded-[2px] bg-popover dark:shadow-none';

// The diamond pokes 5 px out of the edge facing the trigger; its two outer sides carry the border.
/**
 * Constant SIDES
 *
 * @description
 * Arrow classes by panel side.
 *
 * @type {Record<CwPopoverSide, string>}
 */
const SIDES: Record<CwPopoverSide, string> = {
  top: '-bottom-[5px] border-r border-b shadow-[1.5px_1.5px_2px_-0.5px_var(--shadow-contact)]',
  right: '-left-[5px] border-b border-l shadow-[-1.5px_1.5px_2px_-0.5px_var(--shadow-contact)]',
  bottom: '-top-[5px] border-t border-l shadow-[-1px_-1px_2px_-0.5px_var(--shadow-contact)]',
  left: '-right-[5px] border-t border-r shadow-[1.5px_-1.5px_2px_-0.5px_var(--shadow-contact)]',
};

// Along the edge: centered, or under the middle of a 32 px trigger when the panel is aligned on one
// of its edges.
/**
 * Constant ALONG
 *
 * @description
 * Arrow classes by alignment and axis.
 *
 * @type {Record<'horizontal' | 'vertical', Record<CwPopoverAlign, string>>}
 */
const ALONG: Record<'horizontal' | 'vertical', Record<CwPopoverAlign, string>> = {
  horizontal: {
    start: 'start-4 -translate-x-1/2 rtl:translate-x-1/2',
    center: 'left-1/2 -translate-x-1/2',
    end: 'end-4 translate-x-1/2 rtl:-translate-x-1/2',
  },
  vertical: {
    start: 'top-4 -translate-y-1/2',
    center: 'top-1/2 -translate-y-1/2',
    end: 'bottom-4 translate-y-1/2',
  },
};

/**
 * Component CwPopoverArrow
 *
 * @description
 * The diamond of a popover panel, pointing to its trigger (Popover sheet, "Anatomie" 5).
 *
 * `cw-popover` draws it itself when its `arrow` input is set, on the side the panel actually took;
 * place one by hand only in a static rendering of a panel, inside a `relative` container. It is
 * decorative (`aria-hidden`).
 */
@Component({
  selector: 'cw-popover-arrow',
  host: {
    'aria-hidden': 'true',
    '[class]': 'classes()',
    '[attr.data-side]': 'side()',
    '[attr.data-align]': 'align()',
  },
  templateUrl: './popover-arrow.component.html',
})
export class CwPopoverArrow {
  // #region Properties
  /**
   * Property side
   * @readonly
   *
   * @description
   * Side of the trigger where the panel sits.
   *
   * @type {InputSignal<CwPopoverSide>}
   */
  public readonly side: InputSignal<CwPopoverSide> = input<CwPopoverSide>('bottom');

  /**
   * Property align
   * @readonly
   *
   * @description
   * Panel alignment along its side.
   *
   * @type {InputSignal<CwPopoverAlign>}
   */
  public readonly align: InputSignal<CwPopoverAlign> = input<CwPopoverAlign>('center');

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Arrow classes for side and alignment.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => {
    const side: CwPopoverSide = this.side();
    const axis: 'horizontal' | 'vertical' =
      side === 'top' || side === 'bottom' ? 'horizontal' : 'vertical';
    return `${BASE} ${SIDES[side]} ${ALONG[axis][this.align()]}`;
  });
  // #endregion
}
