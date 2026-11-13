import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { CwBanner } from './banner.component';

/** The actions of a banner: one or two `sm` buttons, `ghost` then `outline`. */
@Component({
  selector: 'cw-banner-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  templateUrl: './banner-actions.component.html',
})
export class CwBannerActions {
  private readonly banner = inject(CwBanner, { optional: true });

  protected readonly classes = computed(() =>
    this.banner?.multiline()
      ? 'flex shrink-0 items-center gap-1.5 -my-1'
      : 'flex shrink-0 items-center gap-1.5',
  );
}
