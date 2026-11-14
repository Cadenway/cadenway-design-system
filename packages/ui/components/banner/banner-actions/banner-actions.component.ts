import { Component, computed, inject, type Signal } from '@angular/core';

import { CwBanner } from '../banner.component';

/**
 * Class CwBannerActions
 * @class CwBannerActions
 *
 * @description
 * Groups one or two small banner actions, using ghost then outline button styles.
 */
@Component({
  selector: 'cw-banner-actions',
  host: {
    '[class]': 'classes()',
  },
  templateUrl: './banner-actions.component.html',
})
export class CwBannerActions {
  // #region Properties
  /**
   * Property banner
   * @readonly
   *
   * @description
   * Parent banner supplying the message layout, or null outside a banner.
   *
   * @type {CwBanner | null}
   */
  private readonly banner: CwBanner | null = inject(CwBanner, { optional: true });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Action-row classes, with a vertical adjustment for multiline banners.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() =>
    this.banner?.multiline()
      ? 'flex shrink-0 items-center gap-1.5 -my-1'
      : 'flex shrink-0 items-center gap-1.5',
  );
  // #endregion
}
