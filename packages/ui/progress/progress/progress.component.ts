import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

import type { CwProgressSize, CwProgressState, CwProgressVariant } from '../progress.types';

/* Literal class strings (Progress sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. */
const TRACK = 'relative block w-full overflow-hidden rounded-full bg-track';

const SIZES: Record<CwProgressSize, string> = {
  sm: 'h-1',
  default: 'h-1.5',
  lg: 'h-2',
};

const FILLS: Record<CwProgressVariant, string> = {
  default: 'bg-foreground',
  success: 'bg-jade',
  destructive: 'bg-destructive',
};

const DETERMINATE =
  'block h-full rounded-full transition-[width] duration-300 ease-snap motion-reduce:transition-none';

const INDETERMINATE =
  'absolute inset-y-0 left-[30%] block w-2/5 animate-pulse rounded-full motion-reduce:animate-none';

/** Turns an amount accepted from a template into a number, keeping `null` for "unknown". */
function nullableNumber(value: unknown): number | null {
  return value === null || value === undefined || value === '' ? null : numberAttribute(value);
}

/**
 * A progress bar: how far an operation or a set of items has gone, on a `track` with an ink fill,
 * or jade or grenat when the color carries a meaning (Progress sheet of the Design System
 * artifact).
 *
 * The host is the `role="progressbar"` element, named by the required `ariaLabel`, with
 * `aria-valuemin` 0, `aria-valuemax` `max` and `aria-valuenow` `value` (clamped to the range).
 * `value` `null` is an unknown amount: a pulsing segment and no `aria-valuenow`. `valueText` is the
 * `aria-valuetext` (« 2 sur 5 »), « 40 % » by default. The bar never carries the information alone:
 * write the value next to it, and announce the end of a long operation once (CDK `LiveAnnouncer`),
 * not every percentage. Style hooks: `data-state`, `data-variant`, `data-size`.
 */
@Component({
  selector: 'cw-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    '[class]': 'classes()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-valuemin]': 'state() === "indeterminate" ? null : 0',
    '[attr.aria-valuemax]': 'state() === "indeterminate" ? null : max()',
    '[attr.aria-valuenow]': 'clamped()',
    '[attr.aria-valuetext]': 'text()',
    '[attr.data-state]': 'state()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './progress.component.html',
})
export class CwProgress {
  /** Amount done, from 0 to `max`; `null` when it is unknown (indeterminate). */
  readonly value = input<number | null, unknown>(null, { transform: nullableNumber });
  /** Amount at completion: `[value]="2" [max]="5"` reads « 2 / 5 ». */
  readonly max = input(100, { transform: numberAttribute });
  /** Color of the fill. */
  readonly variant = input<CwProgressVariant>('default');
  /** Height of the track; one size per context. */
  readonly size = input<CwProgressSize>('default');
  /** Accessible name (« Sous-tâches terminées »). */
  readonly ariaLabel = input.required<string>();
  /** `aria-valuetext` (« 2 sur 5 »); the rounded percentage (« 40 % ») when not given. */
  readonly valueText = input<string | null>(null);

  protected readonly clamped = computed(() => {
    const value = this.value();
    if (value === null || Number.isNaN(value)) return null;
    return Math.min(Math.max(value, 0), this.max());
  });

  protected readonly percent = computed(() => {
    const value = this.clamped();
    const max = this.max();
    return value === null || max <= 0 ? 0 : (value / max) * 100;
  });

  protected readonly state = computed<CwProgressState>(() => {
    const value = this.clamped();
    if (value === null) return 'indeterminate';
    return value >= this.max() ? 'complete' : 'loading';
  });

  protected readonly text = computed(() => {
    if (this.state() === 'indeterminate') return this.valueText();
    return this.valueText() ?? `${String(Math.round(this.percent()))} %`;
  });

  protected readonly classes = computed(() => `${TRACK} ${SIZES[this.size()]}`);
  protected readonly determinateClasses = computed(() => `${DETERMINATE} ${FILLS[this.variant()]}`);
  protected readonly indeterminateClasses = computed(
    () => `${INDETERMINATE} ${FILLS[this.variant()]}`,
  );
}
