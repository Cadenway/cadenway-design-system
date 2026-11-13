import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { CwItem } from '../item/item.component';

/**
 * The title of an item, one truncated line. On an `unread` item it starts with a dot and ends
 * with the hidden « (non lu) », so the state does not rest on the fill alone.
 */
@Component({
  selector: 'cw-item-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-w-0 items-center gap-2 leading-5 font-medium' },
  templateUrl: './item-title.component.html',
})
export class CwItemTitle {
  private readonly item = inject(CwItem, { optional: true });

  protected readonly unread = computed(() => this.item?.unread() ?? false);
  protected readonly unreadLabel = computed(() => this.item?.unreadLabel() ?? '');
}
