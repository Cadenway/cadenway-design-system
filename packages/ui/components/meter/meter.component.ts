import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCheckCircleFill,
  phosphorWarningCircleFill,
  phosphorWarningFill,
} from '@ng-icons/phosphor-icons/fill';

import type {
  CwMeterFormat,
  CwMeterSeries,
  CwMeterSize,
  CwMeterVariant,
  CwMeterZone,
} from './meter.types';

/**
 * Constant HEIGHTS
 *
 * @description
 * Literal track height classes for each gauge size.
 *
 * @type {Record<CwMeterSize, string>}
 */
const HEIGHTS: Record<CwMeterSize, string> = {
  sm: 'h-1',
  default: 'h-1.5',
  lg: 'h-2.5',
};

/**
 * Constant ZONE_FILLS
 *
 * @description
 * Fill color classes for each measured zone.
 *
 * @type {Record<CwMeterZone, string>}
 */
const ZONE_FILLS: Record<CwMeterZone, string> = {
  normal: 'bg-foreground',
  high: 'bg-balise',
  critical: 'bg-grenat',
  optimum: 'bg-jade',
};

/**
 * Constant NOTE_TEXTS
 *
 * @description
 * Note text colors for each zone, keeping high-zone text muted.
 *
 * @type {Record<CwMeterZone, string>}
 */
const NOTE_TEXTS: Record<CwMeterZone, string> = {
  normal: 'text-muted-foreground',
  high: 'text-muted-foreground',
  critical: 'text-destructive',
  optimum: 'text-jade-text',
};

/**
 * Constant NOTE_ICONS
 *
 * @description
 * Icon and tone for each zone's note, when applicable.
 *
 * @type {Record<CwMeterZone, { name: string; tone: string } | null>}
 */
const NOTE_ICONS: Record<CwMeterZone, { name: string; tone: string } | null> = {
  normal: null,
  high: { name: 'phosphorWarningFill', tone: 'shrink-0 text-balise' },
  critical: { name: 'phosphorWarningCircleFill', tone: 'shrink-0' },
  optimum: { name: 'phosphorCheckCircleFill', tone: 'shrink-0' },
};

/**
 * Constant SERIES_FILLS
 *
 * @description
 * Neutral fill classes for the first three stacked series.
 *
 * @type {readonly ['bg-foreground', 'bg-muted-foreground', 'bg-muted-foreground/45']}
 */
const SERIES_FILLS: readonly ['bg-foreground', 'bg-muted-foreground', 'bg-muted-foreground/45'] = [
  'bg-foreground',
  'bg-muted-foreground',
  'bg-muted-foreground/45',
] as const;

/**
 * Constant TRACK
 *
 * @description
 * Base classes for a continuous track.
 *
 * @type {string}
 */
const TRACK: string = 'flex w-full overflow-hidden rounded-full bg-track';

/**
 * Constant SEGMENTED_TRACK
 *
 * @description
 * Layout classes for a segmented track.
 *
 * @type {string}
 */
const SEGMENTED_TRACK: string = 'flex w-full gap-1';

/**
 * Constant FILL
 *
 * @description
 * Fill classes with a reduced-motion-aware width transition.
 *
 * @type {string}
 */
const FILL: string =
  'block h-full rounded-full transition-[width] duration-500 ease-snap motion-reduce:transition-none';
/**
 * Constant SEGMENT
 *
 * @description
 * Segment classes with a reduced-motion-aware color transition.
 *
 * @type {string}
 */
const SEGMENT: string =
  'block h-full flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none';
/**
 * Constant SKELETON_TRACK
 *
 * @description
 * Loading placeholder classes for the track.
 *
 * @type {string}
 */
const SKELETON_TRACK: string =
  'block w-full animate-pulse rounded-full bg-secondary motion-reduce:animate-none';

/**
 * Function nullableNumber
 *
 * @description
 * Converts template input to a number, preserving null for an unmeasured value.
 *
 * @param {unknown} value - Template input to normalize.
 *
 * @returns {number | null} Number or null when the value is absent.
 */
function nullableNumber(value: unknown): number | null {
  return value === null || value === undefined || value === '' ? null : numberAttribute(value);
}

/**
 * Function optionalNumber
 *
 * @description
 * Converts an optional template threshold to a number, or undefined when unset.
 *
 * @param {unknown} value - Optional threshold input to normalize.
 *
 * @returns {number | undefined} Number or undefined when the value is absent.
 */
function optionalNumber(value: unknown): number | undefined {
  return value === null || value === undefined || value === '' ? undefined : numberAttribute(value);
}

/**
 * Constant NUMBER
 *
 * @description
 * French number formatter for gauge amounts.
 *
 * @type {Intl.NumberFormat}
 */
const NUMBER: Intl.NumberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

/**
 * Function formatNumber
 *
 * @description
 * Formats a gauge amount as a French number.
 *
 * @param {number} value - Amount to format.
 *
 * @returns {string} Amount formatted using French number conventions.
 */
function formatNumber(value: number): string {
  return NUMBER.format(value);
}

/**
 * Class CwMeter
 * @class CwMeter
 *
 * @description
 * A gauge of a measured level in a known range (storage, seats, API calls, sprint load, password
 * strength), with zones: normal, high, critical, optimum (Meter sheet of the Design System
 * artifact). For the progress of an operation, use `cw-progress`.
 *
 * The zone follows the value as for the HTML `<meter>`: critical beyond `max`, from `critical`
 * (95 % of the range) or over `threshold`; optimum when `optimum` is set and the value lies in
 * `[low, high]`; high from `high` (80 % of the range); normal below. `zone` forces it for a
 * qualitative scale where low values are the bad ones (password strength). `threshold` draws the
 * capacity mark, colors the part over it in grenat and writes « +N » in the header.
 *
 * The track is one `role="meter"` element (also in `segmented` and `stacked`) with
 * `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (the `format` output, plus
 * « +N » over the threshold); it is named by the header `label`, or by `ariaLabel` without a header,
 * and described by the `note`. `value` `null` is "not measured": « — » and `unmeasuredText`.
 * `loading` replaces the track and the value by skeletons and sets `aria-busy`. Never focusable;
 * wrap it in a link to lead somewhere. Style hooks on the host: `data-zone`, `data-over`,
 * `data-variant`, `data-size`.
 */
@Component({
  selector: 'cw-meter',
  imports: [NgIcon],
  providers: [
    provideIcons({ phosphorCheckCircleFill, phosphorWarningCircleFill, phosphorWarningFill }),
  ],
  host: {
    class: 'block',
    '[attr.data-zone]': 'loading() ? null : currentZone()',
    '[attr.data-over]': 'over() > 0 ? "" : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  templateUrl: './meter.component.html',
})
export class CwMeter {
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Measured value; `null` when not measured. With `stacked`, `null` takes the sum of `series`.
   *
   * @type {InputSignalWithTransform<number | null, unknown>}
   */
  public readonly value: InputSignalWithTransform<number | null, unknown> = input.required<
    number | null,
    unknown
  >({ transform: nullableNumber });

  /**
   * Property min
   * @readonly
   *
   * @description
   * Bottom of the scale.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly min: InputSignalWithTransform<number, unknown> = input(0, {
    transform: numberAttribute,
  });

  /**
   * Property max
   * @readonly
   *
   * @description
   * Top of the scale.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly max: InputSignalWithTransform<number, unknown> = input(100, {
    transform: numberAttribute,
  });

  /**
   * Property high
   * @readonly
   *
   * @description
   * Start of the high zone; 80 % of the range when not given.
   *
   * @type {InputSignalWithTransform<number | undefined, unknown>}
   */
  public readonly high: InputSignalWithTransform<number | undefined, unknown> = input<
    number | undefined,
    unknown
  >(undefined, {
    transform: optionalNumber,
  });

  /**
   * Property critical
   * @readonly
   *
   * @description
   * Start of the critical zone; 95 % of the range when not given.
   *
   * @type {InputSignalWithTransform<number | undefined, unknown>}
   */
  public readonly critical: InputSignalWithTransform<number | undefined, unknown> = input<
    number | undefined,
    unknown
  >(undefined, {
    transform: optionalNumber,
  });

  /**
   * Property low
   * @readonly
   *
   * @description
   * End of the low zone, the bottom of the optimum band; `min` when not given.
   *
   * @type {InputSignalWithTransform<number | undefined, unknown>}
   */
  public readonly low: InputSignalWithTransform<number | undefined, unknown> = input<
    number | undefined,
    unknown
  >(undefined, {
    transform: optionalNumber,
  });

  /**
   * Property optimum
   * @readonly
   *
   * @description
   * Ideal value; enables the optimum zone over `[low, high]`.
   *
   * @type {InputSignalWithTransform<number | undefined, unknown>}
   */
  public readonly optimum: InputSignalWithTransform<number | undefined, unknown> = input<
    number | undefined,
    unknown
  >(undefined, {
    transform: optionalNumber,
  });

  /**
   * Property threshold
   * @readonly
   *
   * @description
   * Capacity below `max`: a vertical mark, and the part over it counts as an overrun.
   *
   * @type {InputSignalWithTransform<number | undefined, unknown>}
   */
  public readonly threshold: InputSignalWithTransform<number | undefined, unknown> = input<
    number | undefined,
    unknown
  >(undefined, {
    transform: optionalNumber,
  });

  /**
   * Property thresholdLabel
   * @readonly
   *
   * @description
   * Label of the capacity mark.
   *
   * @type {InputSignal<string>}
   */
  public readonly thresholdLabel: InputSignal<string> = input('Capacité');

  /**
   * Property zone
   * @readonly
   *
   * @description
   * Forces the zone instead of deriving it from the value (qualitative scales).
   *
   * @type {InputSignal<CwMeterZone | null>}
   */
  public readonly zone: InputSignal<CwMeterZone | null> = input<CwMeterZone | null>(null);

  /**
   * Property variant
   * @readonly
   *
   * @description
   * Shape of the gauge.
   *
   * @type {InputSignal<CwMeterVariant>}
   */
  public readonly variant: InputSignal<CwMeterVariant> = input<CwMeterVariant>('bar');

  /**
   * Property segments
   * @readonly
   *
   * @description
   * Number of blocks of a `segmented` gauge.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly segments: InputSignalWithTransform<number, unknown> = input(10, {
    transform: numberAttribute,
  });

  /**
   * Property series
   * @readonly
   *
   * @description
   * Parts of a `stacked` gauge, three at most (the others are ignored).
   *
   * @type {InputSignal<readonly CwMeterSeries[]>}
   */
  public readonly series: InputSignal<readonly CwMeterSeries[]> = input<readonly CwMeterSeries[]>(
    [],
  );

  /**
   * Property size
   * @readonly
   *
   * @description
   * Height of the track.
   *
   * @type {InputSignal<CwMeterSize>}
   */
  public readonly size: InputSignal<CwMeterSize> = input<CwMeterSize>('default');

  /**
   * Property label
   * @readonly
   *
   * @description
   * Header label and accessible name.
   *
   * @type {InputSignal<string>}
   */
  public readonly label: InputSignal<string> = input('');

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name when there is no header (« Charge de Léa Martin » in a table cell).
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input('');

  /**
   * Property showValue
   * @readonly
   *
   * @description
   * Writes the formatted value at the right of the header.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly showValue: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property format
   * @readonly
   *
   * @description
   * Text of the value, reused as `aria-valuetext`; the rounded share of the range (« 64 % »).
   *
   * @type {InputSignal<CwMeterFormat | null>}
   */
  public readonly format: InputSignal<CwMeterFormat | null> = input<CwMeterFormat | null>(null);

  /**
   * Property formatAmount
   * @readonly
   *
   * @description
   * Text of an amount on the legend and the capacity scale; a French number (« 4,1 »).
   *
   * @type {InputSignal<(value: number) => string>}
   */
  public readonly formatAmount: InputSignal<(value: number) => string> =
    input<(value: number) => string>(formatNumber);

  /**
   * Property note
   * @readonly
   *
   * @description
   * Message under the track; its icon and color come from the zone.
   *
   * @type {InputSignal<string>}
   */
  public readonly note: InputSignal<string> = input('');

  /**
   * Property showLegend
   * @readonly
   *
   * @description
   * Shows the legend of a `stacked` gauge.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly showLegend: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property freeLabel
   * @readonly
   *
   * @description
   * Legend label of the room left in a `stacked` gauge.
   *
   * @type {InputSignal<string>}
   */
  public readonly freeLabel: InputSignal<string> = input('Libre');

  /**
   * Property unmeasuredText
   * @readonly
   *
   * @description
   * `aria-valuetext` of a gauge without a value.
   *
   * @type {InputSignal<string>}
   */
  public readonly unmeasuredText: InputSignal<string> = input('Aucune mesure');

  /**
   * Property loading
   * @readonly
   *
   * @description
   * Shows skeletons in place of the track and the value; `aria-busy`.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly loading: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property ids
   * @readonly
   *
   * @description
   * Identifier generator for accessible label and note references.
   *
   * @type {_IdGenerator}
   */
  private readonly ids: _IdGenerator = inject(_IdGenerator);

  /**
   * Property labelId
   * @readonly
   *
   * @description
   * Unique identifier for the gauge label.
   *
   * @type {string}
   */
  protected readonly labelId: string = this.ids.getId('cw-meter-label-');

  /**
   * Property noteId
   * @readonly
   *
   * @description
   * Unique identifier for the note.
   *
   * @type {string}
   */
  protected readonly noteId: string = this.ids.getId('cw-meter-note-');

  /**
   * Property segmentEmpty
   * @readonly
   *
   * @description
   * Classes for an unfilled gauge segment.
   *
   * @type {string}
   */
  protected readonly segmentEmpty: string = `${SEGMENT} bg-track`;

  /**
   * Property underClasses
   * @readonly
   *
   * @description
   * Classes for the fill below the capacity threshold.
   *
   * @type {string}
   */
  protected readonly underClasses: string =
    'block h-full bg-foreground transition-[width] duration-500 ease-snap motion-reduce:transition-none';

  /**
   * Property overClasses
   * @readonly
   *
   * @description
   * Classes for the fill exceeding the capacity threshold.
   *
   * @type {string}
   */
  protected readonly overClasses: string =
    'block h-full border-l-2 border-background bg-grenat transition-[width] duration-500 ease-snap motion-reduce:transition-none';

  /**
   * Property total
   * @readonly
   *
   * @description
   * Measured value or the sum of visible stacked series.
   *
   * @type {Signal<number | null>}
   */
  protected readonly total: Signal<number | null> = computed(() => {
    const value: number | null = this.value();
    if (value !== null || this.variant() !== 'stacked' || this.series().length === 0) return value;
    return this.seriesSum();
  });

  /**
   * Property over
   * @readonly
   *
   * @description
   * Amount exceeding the capacity threshold.
   *
   * @type {Signal<number>}
   */
  protected readonly over: Signal<number> = computed(() => {
    const total: number | null = this.total();
    const threshold: number | undefined = this.threshold();
    return total === null || threshold === undefined ? 0 : Math.max(0, total - threshold);
  });

  /**
   * Property currentZone
   * @readonly
   *
   * @description
   * Explicit or calculated zone for the measured amount.
   *
   * @type {Signal<CwMeterZone>}
   */
  protected readonly currentZone: Signal<CwMeterZone> = computed<CwMeterZone>(() => {
    const forced: CwMeterZone | null = this.zone();
    if (forced) return forced;
    const total: number | null = this.total();
    if (total === null) return 'normal';
    const min: number = this.min();
    const range: number = this.max() - min;
    const high: number = this.high() ?? min + range * 0.8;
    const critical: number = this.critical() ?? min + range * 0.95;
    if (this.over() > 0 || total > this.max() || total >= critical) return 'critical';
    const optimum: number | undefined = this.optimum();
    if (optimum !== undefined && total >= (this.low() ?? min) && total <= high) return 'optimum';
    return total >= high ? 'high' : 'normal';
  });

  /**
   * Property display
   * @readonly
   *
   * @description
   * Formatted measured value for the header.
   *
   * @type {Signal<string>}
   */
  protected readonly display: Signal<string> = computed(() => {
    const total: number | null = this.total();
    if (total === null) return '—';
    const format: CwMeterFormat | null = this.format();
    return format ? format(total, this.max()) : `${String(Math.round(this.percent(total)))} %`;
  });

  /**
   * Property overText
   * @readonly
   *
   * @description
   * Formatted amount exceeding the capacity threshold.
   *
   * @type {Signal<string>}
   */
  protected readonly overText: Signal<string> = computed(() => formatNumber(this.over()));

  /**
   * Property valueText
   * @readonly
   *
   * @description
   * Accessible value text including any overrun.
   *
   * @type {Signal<string>}
   */
  protected readonly valueText: Signal<string> = computed(() => {
    if (this.total() === null) return this.unmeasuredText();
    return this.over() > 0 ? `${this.display()}, +${this.overText()}` : this.display();
  });

  /**
   * Property blocks
   * @readonly
   *
   * @description
   * Filled state of each segmented gauge block.
   *
   * @type {Signal<boolean[]>}
   */
  protected readonly blocks: Signal<boolean[]> = computed(() => {
    const count: number = Math.max(0, Math.round(this.segments()));
    const total: number | null = this.total();
    const filled: number = total === null ? 0 : Math.round((this.percent(total) / 100) * count);
    return Array.from({ length: count }, (_, index) => index < filled);
  });

  /**
   * Property visibleSeries
   * @readonly
   *
   * @description
   * First three stacked series displayed by the gauge.
   *
   * @type {Signal<CwMeterSeries[]>}
   */
  private readonly visibleSeries: Signal<CwMeterSeries[]> = computed(() =>
    this.series().slice(0, SERIES_FILLS.length),
  );

  /**
   * Property seriesSum
   * @readonly
   *
   * @description
   * Sum of visible series rounded to reduce decimal precision errors.
   *
   * @type {Signal<number>}
   */
  private readonly seriesSum: Signal<number> = computed(
    () => Math.round(this.visibleSeries().reduce((sum, part) => sum + part.value, 0) * 1e6) / 1e6,
  );

  /**
   * Property parts
   * @readonly
   *
   * @description
   * Display geometry and legend classes for visible series.
   *
   * @type {Signal<{ label: string; value: number; width: number; classes: string; swatch: string }[]>}
   */
  protected readonly parts: Signal<
    { label: string; value: number; width: number; classes: string; swatch: string }[]
  > = computed(() => {
    const range: number = this.max() - this.min();
    return this.visibleSeries().map((part, index) => ({
      label: part.label,
      value: part.value,
      width: range > 0 ? Math.max(0, (part.value / range) * 100) : 0,
      classes: `block h-full border-r-2 border-background ${SERIES_FILLS[index] ?? ''}`,
      swatch: `size-2 shrink-0 rounded-[3px] ${SERIES_FILLS[index] ?? ''}`,
    }));
  });

  /**
   * Property free
   * @readonly
   *
   * @description
   * Remaining capacity after the visible series.
   *
   * @type {Signal<number>}
   */
  protected readonly free: Signal<number> = computed(
    () => Math.round(Math.max(0, this.max() - this.min() - this.seriesSum()) * 1e6) / 1e6,
  );

  /**
   * Property overWidth
   * @readonly
   *
   * @description
   * Percentage width of the portion above the threshold.
   *
   * @type {Signal<number>}
   */
  protected readonly overWidth: Signal<number> = computed(() => {
    const total: number = this.total() ?? 0;
    return this.percent(Math.min(total, this.max())) - this.percent(this.threshold() ?? 0);
  });

  /**
   * Property trackClasses
   * @readonly
   *
   * @description
   * Track layout and height classes.
   *
   * @type {Signal<string>}
   */
  protected readonly trackClasses: Signal<string> = computed(
    () => `${this.variant() === 'segmented' ? SEGMENTED_TRACK : TRACK} ${HEIGHTS[this.size()]}`,
  );

  /**
   * Property fillClasses
   * @readonly
   *
   * @description
   * Continuous fill classes for the current zone.
   *
   * @type {Signal<string>}
   */
  protected readonly fillClasses: Signal<string> = computed(
    () => `${FILL} ${ZONE_FILLS[this.currentZone()]}`,
  );

  /**
   * Property segmentFilled
   * @readonly
   *
   * @description
   * Filled segment classes for the current zone.
   *
   * @type {Signal<string>}
   */
  protected readonly segmentFilled: Signal<string> = computed(
    () => `${SEGMENT} ${ZONE_FILLS[this.currentZone()]}`,
  );

  /**
   * Property skeletonClasses
   * @readonly
   *
   * @description
   * Loading track classes for the current size.
   *
   * @type {Signal<string>}
   */
  protected readonly skeletonClasses: Signal<string> = computed(
    () => `${SKELETON_TRACK} ${HEIGHTS[this.size()]}`,
  );

  /**
   * Property noteClasses
   * @readonly
   *
   * @description
   * Note layout and text color for the current zone.
   *
   * @type {Signal<string>}
   */
  protected readonly noteClasses: Signal<string> = computed(
    () => `mt-1.5 flex items-center gap-1 text-xs ${NOTE_TEXTS[this.currentZone()]}`,
  );

  /**
   * Property noteIcon
   * @readonly
   *
   * @description
   * Note icon for the current zone, or null when unmeasured.
   *
   * @type {Signal<{ name: string; tone: string } | null>}
   */
  protected readonly noteIcon: Signal<{ name: string; tone: string } | null> = computed(() =>
    this.total() === null ? null : NOTE_ICONS[this.currentZone()],
  );
  // #endregion

  // #region Methods
  /**
   * Method percent
   * @method percent
   *
   * @description
   * Returns the position of an amount in the range, clamped from zero to one hundred.
   *
   * @param {number} amount - Amount whose position in the range is requested.
   *
   * @returns {number} Position in the range, clamped to zero through one hundred.
   */
  protected percent(amount: number): number {
    const min: number = this.min();
    const range: number = this.max() - min;
    if (range <= 0) return 0;
    return Math.min(100, Math.max(0, ((amount - min) / range) * 100));
  }

  /**
   * Method amount
   * @method amount
   *
   * @description
   * Formats an amount using the supplied formatter.
   *
   * @param {number} value - Amount to format.
   *
   * @returns {string} Text produced by the configured formatter.
   */
  protected amount(value: number): string {
    return this.formatAmount()(value);
  }
  // #endregion
}
