import { Component, computed, inject, type Signal } from '@angular/core';

import { CwItem } from '../item.component';
import type { CwItemSize } from '../item.types';

/**
 * Constant DESCRIPTIONS
 *
 * @description
 * Description classes by item size.
 *
 * @type {Record<CwItemSize, string>}
 */
const DESCRIPTIONS: Record<CwItemSize, string> = {
  default: 'line-clamp-2 text-sm leading-5 text-muted-foreground',
  sm: 'line-clamp-2 text-sm leading-5 text-muted-foreground',
  xs: 'truncate text-xs text-muted-foreground',
};

/**
 * Component CwItemDescription
 *
 * @description
 * The description of an item, two lines at most (one truncated line in `xs`).
 */
@Component({
  selector: 'cw-item-description',
  host: { '[class]': 'classes()' },
  templateUrl: './item-description.component.html',
})
export class CwItemDescription {
  // #region Properties
  /**
   * Property item
   * @readonly
   *
   * @description
   * Parent item supplying the row state.
   *
   * @type {CwItem | null}
   */
  private readonly item: CwItem | null = inject(CwItem, { optional: true });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Classes selected from the parent item size.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => DESCRIPTIONS[this.item?.size() ?? 'default'],
  );
  // #endregion
}
