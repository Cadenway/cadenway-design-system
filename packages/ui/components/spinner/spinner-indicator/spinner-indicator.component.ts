import {
  booleanAttribute,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
  type InputSignal,
  type InputSignalWithTransform,
  type WritableSignal,
} from '@angular/core';

import { CwSpinner } from '../spinner.component';
import type { CwSpinnerSize } from '../spinner.types';

/**
 * Class CwSpinnerIndicator
 * @class CwSpinnerIndicator
 *
 * @description
 * A spinner with its optional visible label, shown only when a wait lasts: it appears after `delay`
 * (300 ms) to avoid a flicker, then stays at least `minDuration` (500 ms) once shown.
 *
 * Bind `active` to the wait. The label (« Chargement » by default) is the accessible name; with
 * `showLabel` it is also written next to the ring, in `text-muted-foreground`.
 */
@Component({
  selector: 'cw-spinner',
  imports: [CwSpinner],
  host: {
    class: 'inline-flex items-center gap-2 text-muted-foreground',
    '[attr.role]': 'visible() ? "status" : null',
    '[attr.aria-live]': '"polite"',
  },
  templateUrl: './spinner-indicator.component.html',
})
export class CwSpinnerIndicator {
  // #region Properties
  /**
   * Property active
   * @readonly
   *
   * @description
   * Input indicating whether the operation is still in progress.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default true
   */
  public readonly active: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting the diameter of the spinner ring.
   *
   * @type {InputSignal<CwSpinnerSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwSpinnerSize> = input<CwSpinnerSize>('default');

  /**
   * Property label
   * @readonly
   *
   * @description
   * Accessible name of the wait, also displayed when `showLabel` is true.
   *
   * @type {InputSignal<string>}
   * @default 'Chargement'
   */
  public readonly label: InputSignal<string> = input('Chargement');

  /**
   * Property showLabel
   * @readonly
   *
   * @description
   * Input controlling whether the accessible label is also visible beside the ring.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly showLabel: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property delay
   * @readonly
   *
   * @description
   * Input setting the wait in milliseconds before the spinner becomes visible.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @default 300
   */
  public readonly delay: InputSignalWithTransform<number, unknown> = input(300, {
    transform: numberAttribute,
  });

  /**
   * Property minDuration
   * @readonly
   *
   * @description
   * Input setting the minimum visible time in milliseconds after the spinner appears.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @default 500
   */
  public readonly minDuration: InputSignalWithTransform<number, unknown> = input(500, {
    transform: numberAttribute,
  });

  /**
   * Property visible
   * @readonly
   *
   * @description
   * Signal indicating whether the delayed indicator is currently shown.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  protected readonly visible: WritableSignal<boolean> = signal(false);

  /**
   * Property shownAt
   *
   * @description
   * Timestamp in milliseconds at which the indicator last became visible.
   *
   * @type {number}
   * @default 0
   */
  private shownAt: number = 0;

  /**
   * Property timer
   *
   * @description
   * Pending show or hide timer, or undefined before a timer has been scheduled.
   *
   * @type {ReturnType<typeof setTimeout> | undefined}
   */
  private timer: ReturnType<typeof setTimeout> | undefined;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Tracks wait changes, scheduling delayed visibility and clearing the pending timer on destruction.
   */
  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
    });
    effect(() => {
      const active: boolean = this.active();
      const delay: number = this.delay();
      const minDuration: number = this.minDuration();
      clearTimeout(this.timer);
      if (active && !this.visible()) {
        this.timer = setTimeout(() => {
          this.shownAt = Date.now();
          this.visible.set(true);
        }, delay);
      } else if (!active && this.visible()) {
        const left: number = Math.max(0, minDuration - (Date.now() - this.shownAt));
        this.timer = setTimeout(() => {
          this.visible.set(false);
        }, left);
      }
    });
  }
  // #endregion
}
