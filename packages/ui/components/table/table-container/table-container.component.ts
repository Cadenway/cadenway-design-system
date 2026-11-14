import {
  afterRenderEffect,
  Component,
  ElementRef,
  inject,
  signal,
  type WritableSignal,
} from '@angular/core';
import { ɵFOCUS_INSET } from '@cadenway/ui/core';

/**
 * Class CwTableContainer
 * @class CwTableContainer
 *
 * @description
 * The scrolling frame of a table: full width, horizontal scrolling when the table is wider. It takes
 * the focus (Tab, then ← and → scroll) only while it overflows.
 */
@Component({
  selector: 'cw-table-container',
  host: {
    '[class]': 'classes',
    '[attr.tabindex]': 'overflowing() ? 0 : null',
  },
  templateUrl: './table-container.component.html',
})
export class CwTableContainer {
  // #region Properties
  /**
   * Property overflowing
   * @readonly
   *
   * @description
   * Whether the frame's scroll width exceeds its visible width, enabling its tab stop.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  protected readonly overflowing: WritableSignal<boolean> = signal(false);

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Full-width horizontal scrolling and inset keyboard-focus classes for the frame.
   *
   * @type {string}
   */
  protected readonly classes: string = `relative block w-full overflow-x-auto ${ɵFOCUS_INSET}`;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Measures overflow after rendering and observes the frame and table for size changes when supported.
   */
  public constructor() {
    const element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    // Table sheet, "Clavier": tabindex="0" only when the frame overflows, so a table that fits
    // adds no stop to the tab order.
    afterRenderEffect((onCleanup) => {
      const measure: () => void = (): void => {
        this.overflowing.set(element.scrollWidth > element.clientWidth);
      };
      measure();
      const view: (Window & typeof globalThis) | null = element.ownerDocument.defaultView;
      if (!view || typeof view.ResizeObserver !== 'function') return;
      const observer: ResizeObserver = new view.ResizeObserver(measure);
      observer.observe(element);
      const table: HTMLTableElement | null = element.querySelector('table');
      if (table) observer.observe(table);
      onCleanup(() => {
        observer.disconnect();
      });
    });
  }
  // #endregion
}
