import { Component, ElementRef, computed, inject, type Signal } from '@angular/core';

import { CW_TOOLBAR, type ToolbarHandle } from '../toolbar.token';
import type { CwToolbarSize } from '../toolbar.types';

/**
 * Constant SIZES
 *
 * @description
 * Separator height classes for each toolbar size.
 *
 * @type {Record<CwToolbarSize, string>}
 */
const SIZES: Record<CwToolbarSize, string> = {
  default: 'mx-1 h-5 w-px shrink-0 bg-border',
  sm: 'mx-1 h-4 w-px shrink-0 bg-border',
};

/**
 * Class CwToolbarSeparator
 * @class CwToolbarSeparator
 *
 * @description
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
  // #region Properties
  /**
   * Property toolbar
   * @readonly
   *
   * @description
   * Optional containing toolbar supplying the common size.
   *
   * @type {ToolbarHandle | null}
   */
  private readonly toolbar: ToolbarHandle | null = inject(CW_TOOLBAR, { optional: true });

  /**
   * Property ɵelement
   * @readonly
   *
   * @description
   * Separator element hidden before an overflowed control.
   * @internal
   *
   * @type {HTMLElement}
   */
  public readonly ɵelement: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Separator classes matching the toolbar size.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => SIZES[this.toolbar?.size() ?? 'default'],
  );
  // #endregion
}
