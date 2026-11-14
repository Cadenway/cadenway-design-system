import { Component, computed, inject, type Signal } from '@angular/core';

import { CwItem } from '../item.component';

/**
 * Component CwItemTitle
 *
 * @description
 * The title of an item, one truncated line. On an `unread` item it starts with a dot and ends
 * with the hidden « (non lu) », so the state does not rest on the fill alone.
 */
@Component({
  selector: 'cw-item-title',
  host: { class: 'flex min-w-0 items-center gap-2 leading-5 font-medium' },
  templateUrl: './item-title.component.html',
})
export class CwItemTitle {
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
   * Property unread
   * @readonly
   *
   * @description
   * Whether the parent item is unread.
   *
   * @type {Signal<boolean>}
   */
  protected readonly unread: Signal<boolean> = computed(() => this.item?.unread() ?? false);

  /**
   * Property unreadLabel
   * @readonly
   *
   * @description
   * Accessible text describing an unread item.
   *
   * @type {Signal<string>}
   */
  protected readonly unreadLabel: Signal<string> = computed(() => this.item?.unreadLabel() ?? '');
  // #endregion
}
