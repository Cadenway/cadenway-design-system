import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { CwItem } from './item.component';
import type { CwItemMediaVariant, CwItemSize } from './item.types';

const MEDIA: Record<CwItemMediaVariant, Record<CwItemSize, string>> = {
  default: {
    default: 'flex shrink-0 items-center justify-center',
    sm: 'flex shrink-0 items-center justify-center',
    xs: 'flex shrink-0 items-center justify-center',
  },
  icon: {
    default:
      'flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground [&_ng-icon]:[--ng-icon__size:1rem]',
    sm: 'flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground [&_ng-icon]:[--ng-icon__size:1rem]',
    xs: 'flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground [&_ng-icon]:[--ng-icon__size:0.875rem]',
  },
  image: {
    default:
      'flex size-10 shrink-0 overflow-hidden rounded-md border [&_img]:size-full [&_img]:object-cover',
    sm: 'flex size-8 shrink-0 overflow-hidden rounded-md border [&_img]:size-full [&_img]:object-cover',
    xs: 'flex size-6 shrink-0 overflow-hidden rounded-md border [&_img]:size-full [&_img]:object-cover',
  },
};

/**
 * The media of an item, before its content: an avatar (`default`), an icon in a `bg-secondary`
 * tile (`icon`) or an image in a framed thumbnail (`image`); sized by the parent item.
 */
@Component({
  selector: 'cw-item-media',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
  },
  templateUrl: './item-media.component.html',
})
export class CwItemMedia {
  /** Shape of the media. */
  readonly variant = input<CwItemMediaVariant>('default');

  private readonly item = inject(CwItem, { optional: true });

  protected readonly classes = computed(
    () => MEDIA[this.variant()][this.item?.size() ?? 'default'],
  );
}
