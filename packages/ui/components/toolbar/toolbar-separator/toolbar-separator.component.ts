import { Component, ElementRef, computed, inject } from '@angular/core';

import { CW_TOOLBAR } from '../toolbar.token';
import type { CwToolbarSize } from '../toolbar.types';

/* Literal class strings (Toolbar sheet and preview of the Design System artifact): 20 px tall in a
   `default` bar, 16 px in a `sm` one. */
const SIZES: Record<CwToolbarSize, string> = {
  default: 'mx-1 h-5 w-px shrink-0 bg-border',
  sm: 'mx-1 h-4 w-px shrink-0 bg-border',
};

/**
 * The vertical line between two groups of a `cw-toolbar` (Toolbar sheet of the Design System
 * artifact): `role="separator"` with `aria-orientation="vertical"`, its height following the size
 * of the bar. Hidden while the control or group right after it sits in the « Plus » menu.
 */
@Component({
  selector: 'cw-toolbar-separator',
  host: {
    role: 'separator',
    'aria-orientation': 'vertical',
    '[class]': 'classes()',
  },
  templateUrl: './toolbar-separator.component.html',
})
export class CwToolbarSeparator {
  private readonly toolbar = inject(CW_TOOLBAR, { optional: true });

  /** The separator element; the toolbar hides it before a hidden control. Not public API. */
  readonly ɵelement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly classes = computed(() => SIZES[this.toolbar?.size() ?? 'default']);
}
