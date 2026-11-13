import { Component, computed, inject, input } from '@angular/core';

import { CwEmpty } from '../empty.component';
import type { CwEmptyMediaTone, CwEmptySize } from '../empty.types';

const MEDIA_SIZES: Record<CwEmptySize, string> = {
  default: 'size-10 [&_ng-icon]:[--ng-icon__size:1.25rem]',
  sm: 'size-8 [&_ng-icon]:[--ng-icon__size:1rem]',
};

const MEDIA_TONES: Record<CwEmptyMediaTone, string> = {
  default: 'text-foreground',
  destructive: 'text-destructive',
};

/**
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
  /** Color of the icon; `destructive` for a loading error. */
  readonly tone = input<CwEmptyMediaTone>('default');

  private readonly empty = inject(CwEmpty, { optional: true });

  protected readonly classes = computed(
    () =>
      `mb-1 flex shrink-0 items-center justify-center rounded-lg bg-muted ${MEDIA_SIZES[this.empty?.size() ?? 'default']} ${MEDIA_TONES[this.tone()]}`,
  );
}
