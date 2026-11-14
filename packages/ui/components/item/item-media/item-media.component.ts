import { Component, computed, inject, type Signal, input, type InputSignal } from '@angular/core';

import { CwItem } from '../item.component';
import type { CwItemMediaVariant, CwItemSize } from '../item.types';

/**
 * Constant MEDIA
 *
 * @description
 * Media classes by variant and item size.
 *
 * @type {Record<CwItemMediaVariant, Record<CwItemSize, string>>}
 */
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
 * Component CwItemMedia
 *
 * @description
 * The media of an item, before its content: an avatar (`default`), an icon in a `bg-secondary`
 * tile (`icon`) or an image in a framed thumbnail (`image`); sized by the parent item.
 */
@Component({
  selector: 'cw-item-media',
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
  },
  templateUrl: './item-media.component.html',
})
export class CwItemMedia {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Shape of the item media.
   *
   * @type {InputSignal<CwItemMediaVariant>}
   */
  public readonly variant: InputSignal<CwItemMediaVariant> = input<CwItemMediaVariant>('default');

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
    () => MEDIA[this.variant()][this.item?.size() ?? 'default'],
  );
  // #endregion
}
