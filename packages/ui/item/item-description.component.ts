import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { CwItem } from './item.component';
import type { CwItemSize } from './item.types';

const DESCRIPTIONS: Record<CwItemSize, string> = {
  default: 'line-clamp-2 text-sm leading-5 text-muted-foreground',
  sm: 'line-clamp-2 text-sm leading-5 text-muted-foreground',
  xs: 'truncate text-xs text-muted-foreground',
};

/** The description of an item, two lines at most (one truncated line in `xs`). */
@Component({
  selector: 'cw-item-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  templateUrl: './item-description.component.html',
})
export class CwItemDescription {
  private readonly item = inject(CwItem, { optional: true });

  protected readonly classes = computed(() => DESCRIPTIONS[this.item?.size() ?? 'default']);
}
