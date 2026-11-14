import { Component, computed, inject, input, type InputSignal, type Signal } from '@angular/core';

import { CwEmpty } from '../empty.component';
import type { CwEmptyMediaTone, CwEmptySize } from '../empty.types';

/**
 * Constant MEDIA_SIZES
 *
 * @description
 * Tile and icon dimensions corresponding to the parent empty-state size.
 *
 * @type {Record<CwEmptySize, string>}
 */
const MEDIA_SIZES: Record<CwEmptySize, string> = {
  default: 'size-10 [&_ng-icon]:[--ng-icon__size:1.25rem]',
  sm: 'size-8 [&_ng-icon]:[--ng-icon__size:1rem]',
};

/**
 * Constant MEDIA_TONES
 *
 * @description
 * Icon color classes for normal and destructive empty-state media.
 *
 * @type {Record<CwEmptyMediaTone, string>}
 */
const MEDIA_TONES: Record<CwEmptyMediaTone, string> = {
  default: 'text-foreground',
  destructive: 'text-destructive',
};

/**
 * Class CwEmptyMedia
 * @class CwEmptyMedia
 *
 * @description
 * The icon tile of an empty state, sized by the parent `cw-empty`; the icon is decorative, the
 * title says what happened. `tone="destructive"` colors the icon of a loading error.
 */
@Component({
  selector: 'cw-empty-media',
  host: {
    '[class]': 'classes()',
    'aria-hidden': 'true',
    '[attr.data-tone]': 'tone()',
  },
  templateUrl: './empty-media.component.html',
})
export class CwEmptyMedia {
  // #region Properties
  /**
   * Property tone
   * @readonly
   *
   * @description
   * Input selecting the icon color; destructive indicates a loading error.
   *
   * @type {InputSignal<CwEmptyMediaTone>}
   * @default 'default'
   */
  public readonly tone: InputSignal<CwEmptyMediaTone> = input<CwEmptyMediaTone>('default');

  /**
   * Property empty
   * @readonly
   *
   * @description
   * Parent empty state providing the tile size, or null when used outside one.
   *
   * @type {CwEmpty | null}
   */
  private readonly empty: CwEmpty | null = inject(CwEmpty, { optional: true });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Computed tile, size and icon-tone classes for the current inputs.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () =>
      `mb-1 flex shrink-0 items-center justify-center rounded-lg bg-muted ${MEDIA_SIZES[this.empty?.size() ?? 'default']} ${MEDIA_TONES[this.tone()]}`,
  );
  // #endregion
}
