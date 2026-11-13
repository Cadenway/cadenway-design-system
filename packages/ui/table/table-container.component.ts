import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  signal,
} from '@angular/core';
import { ɵFOCUS_INSET } from '@cadenway/ui/core';

/**
 * The scrolling frame of a table: full width, horizontal scrolling when the table is wider. It takes
 * the focus (Tab, then ← and → scroll) only while it overflows.
 */
@Component({
  selector: 'cw-table-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes',
    '[attr.tabindex]': 'overflowing() ? 0 : null',
  },
  templateUrl: './table-container.component.html',
})
export class CwTableContainer {
  protected readonly overflowing = signal(false);
  protected readonly classes = `relative block w-full overflow-x-auto ${ɵFOCUS_INSET}`;

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    // Table sheet, "Clavier": tabindex="0" only when the frame overflows, so a table that fits
    // adds no stop to the tab order.
    afterRenderEffect((onCleanup) => {
      const measure = (): void => {
        this.overflowing.set(element.scrollWidth > element.clientWidth);
      };
      measure();
      const view = element.ownerDocument.defaultView;
      if (!view || typeof view.ResizeObserver !== 'function') return;
      const observer = new view.ResizeObserver(measure);
      observer.observe(element);
      const table = element.querySelector('table');
      if (table) observer.observe(table);
      onCleanup(() => {
        observer.disconnect();
      });
    });
  }
}
