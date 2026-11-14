import {
  Component,
  computed,
  input,
  numberAttribute,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';

import type { CwProgressSize, CwProgressState, CwProgressVariant } from './progress.types';

/**
 * Constant TRACK
 *
 * @description
 * Literal Progress sheet classes for the full-width track, kept visible to Tailwind.
 *
 * @type {string}
 */
const TRACK: string = 'relative block w-full overflow-hidden rounded-full bg-track';

/**
 * Constant SIZES
 *
 * @description
 * Track-height classes for each supported progress size.
 *
 * @type {Record<CwProgressSize, string>}
 */
const SIZES: Record<CwProgressSize, string> = {
  sm: 'h-1',
  default: 'h-1.5',
  lg: 'h-2',
};

/**
 * Constant FILLS
 *
 * @description
 * Fill-color classes for neutral, successful and destructive progress.
 *
 * @type {Record<CwProgressVariant, string>}
 */
const FILLS: Record<CwProgressVariant, string> = {
  default: 'bg-foreground',
  success: 'bg-jade',
  destructive: 'bg-destructive',
};

/**
 * Constant DETERMINATE
 *
 * @description
 * Fill and width-transition classes used when a progress amount is known.
 *
 * @type {string}
 */
const DETERMINATE: string =
  'block h-full rounded-full transition-[width] duration-300 ease-snap motion-reduce:transition-none';

/**
 * Constant INDETERMINATE
 *
 * @description
 * Segment and animation classes used when the progress amount is unknown.
 *
 * @type {string}
 */
const INDETERMINATE: string =
  'absolute inset-y-0 left-[30%] block w-2/5 animate-pulse rounded-full motion-reduce:animate-none';

/**
 * Function nullableNumber
 *
 * @description
 * Converts a template value to a number while preserving empty values as an unknown amount.
 *
 * @param {unknown} value - Value supplied to the progress input.
 *
 * @returns {number | null} Converted number, or null for null, undefined or an empty string.
 */
function nullableNumber(value: unknown): number | null {
  return value === null || value === undefined || value === '' ? null : numberAttribute(value);
}

/**
 * Class CwProgress
 * @class CwProgress
 *
 * @description
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
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Input carrying the completed amount; null represents unknown progress.
   *
   * @type {InputSignalWithTransform<number | null, unknown>}
   * @default null
   */
  public readonly value: InputSignalWithTransform<number | null, unknown> = input<
    number | null,
    unknown
  >(null, { transform: nullableNumber });

  /**
   * Property max
   * @readonly
   *
   * @description
   * Input carrying the amount at completion; for example, a value of two with max five is two of five.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @default 100
   */
  public readonly max: InputSignalWithTransform<number, unknown> = input(100, {
    transform: numberAttribute,
  });

  /**
   * Property variant
   * @readonly
   *
   * @description
   * Input selecting the semantic fill color.
   *
   * @type {InputSignal<CwProgressVariant>}
   * @default 'default'
   */
  public readonly variant: InputSignal<CwProgressVariant> = input<CwProgressVariant>('default');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting the height of the track.
   *
   * @type {InputSignal<CwProgressSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwProgressSize> = input<CwProgressSize>('default');

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Required accessible name describing what the progress bar measures.
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input.required<string>();

  /**
   * Property valueText
   * @readonly
   *
   * @description
   * Optional accessible value text; null uses the rounded percentage for known progress.
   *
   * @type {InputSignal<string | null>}
   * @default null
   */
  public readonly valueText: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property clamped
   * @readonly
   *
   * @description
   * Known progress clamped between zero and max when max is non-negative, or null for unknown or
   * non-numeric input. A negative max is returned as the upper bound.
   *
   * @type {Signal<number | null>}
   */
  protected readonly clamped: Signal<number | null> = computed(() => {
    const value: number | null = this.value();
    if (value === null || Number.isNaN(value)) return null;
    return Math.min(Math.max(value, 0), this.max());
  });

  /**
   * Property percent
   * @readonly
   *
   * @description
   * Fill percentage; zero for unknown progress or a non-positive maximum.
   *
   * @type {Signal<number>}
   */
  protected readonly percent: Signal<number> = computed(() => {
    const value: number | null = this.clamped();
    const max: number = this.max();
    return value === null || max <= 0 ? 0 : (value / max) * 100;
  });

  /**
   * Property state
   * @readonly
   *
   * @description
   * Whether the progress is indeterminate, complete or still loading.
   *
   * @type {Signal<CwProgressState>}
   */
  protected readonly state: Signal<CwProgressState> = computed<CwProgressState>(() => {
    const value: number | null = this.clamped();
    if (value === null) return 'indeterminate';
    return value >= this.max() ? 'complete' : 'loading';
  });

  /**
   * Property text
   * @readonly
   *
   * @description
   * Accessible value text: the supplied text, a rounded percentage, or null for unknown progress.
   *
   * @type {Signal<string | null>}
   */
  protected readonly text: Signal<string | null> = computed(() => {
    if (this.state() === 'indeterminate') return this.valueText();
    return this.valueText() ?? `${String(Math.round(this.percent()))} %`;
  });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Track classes combined with the selected height.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => `${TRACK} ${SIZES[this.size()]}`);

  /**
   * Property determinateClasses
   * @readonly
   *
   * @description
   * Known-progress fill classes combined with the selected color.
   *
   * @type {Signal<string>}
   */
  protected readonly determinateClasses: Signal<string> = computed(
    () => `${DETERMINATE} ${FILLS[this.variant()]}`,
  );

  /**
   * Property indeterminateClasses
   * @readonly
   *
   * @description
   * Unknown-progress segment classes combined with the selected color.
   *
   * @type {Signal<string>}
   */
  protected readonly indeterminateClasses: Signal<string> = computed(
    () => `${INDETERMINATE} ${FILLS[this.variant()]}`,
  );
  // #endregion
}
