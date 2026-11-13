import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';

import { CwSpinner } from './spinner.component';
import type { CwSpinnerSize } from './spinner.types';

/**
 * A spinner with its optional visible label, shown only when a wait lasts: it appears after `delay`
 * (300 ms) to avoid a flicker, then stays at least `minDuration` (500 ms) once shown.
 *
 * Bind `active` to the wait. The label (« Chargement » by default) is the accessible name; with
 * `showLabel` it is also written next to the ring, in `text-muted-foreground`.
 */
@Component({
  selector: 'cw-spinner',
  imports: [CwSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex items-center gap-2 text-muted-foreground',
    '[attr.role]': 'visible() ? "status" : null',
    '[attr.aria-live]': '"polite"',
  },
  templateUrl: './spinner-indicator.component.html',
})
export class CwSpinnerIndicator {
  /** Whether the wait is in progress. */
  readonly active = input(true, { transform: booleanAttribute });
  /** Diameter of the ring. */
  readonly size = input<CwSpinnerSize>('default');
  /** What is awaited; the accessible name, and the visible text with `showLabel`. */
  readonly label = input('Chargement');
  /** Writes the label next to the ring. */
  readonly showLabel = input(false, { transform: booleanAttribute });
  /** Time before the spinner appears, in ms. */
  readonly delay = input(300, { transform: numberAttribute });
  /** Minimum time the spinner stays once shown, in ms. */
  readonly minDuration = input(500, { transform: numberAttribute });

  protected readonly visible = signal(false);
  private shownAt = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
    });
    effect(() => {
      const active = this.active();
      const delay = this.delay();
      const minDuration = this.minDuration();
      clearTimeout(this.timer);
      if (active && !this.visible()) {
        this.timer = setTimeout(() => {
          this.shownAt = Date.now();
          this.visible.set(true);
        }, delay);
      } else if (!active && this.visible()) {
        const left = Math.max(0, minDuration - (Date.now() - this.shownAt));
        this.timer = setTimeout(() => {
          this.visible.set(false);
        }, left);
      }
    });
  }
}
