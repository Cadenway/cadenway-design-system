import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
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
} from '../meter.types';

/* Literal class strings (Meter sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. */
const HEIGHTS: Record<CwMeterSize, string> = {
  sm: 'h-1',
  default: 'h-1.5',
  lg: 'h-2.5',
};

const ZONE_FILLS: Record<CwMeterZone, string> = {
  normal: 'bg-foreground',
  high: 'bg-balise',
  critical: 'bg-grenat',
  optimum: 'bg-jade',
};

// Balise yellow is never a text color (1.9:1): in the high zone only the icon is yellow.
const NOTE_TEXTS: Record<CwMeterZone, string> = {
  normal: 'text-muted-foreground',
  high: 'text-muted-foreground',
  critical: 'text-destructive',
  optimum: 'text-jade-text',
};

const NOTE_ICONS: Record<CwMeterZone, { name: string; tone: string } | null> = {
  normal: null,
  high: { name: 'phosphorWarningFill', tone: 'shrink-0 text-balise' },
  critical: { name: 'phosphorWarningCircleFill', tone: 'shrink-0' },
  optimum: { name: 'phosphorCheckCircleFill', tone: 'shrink-0' },
};

// Neutral series, in this order; beyond three series the sheet sends to a Chart.
const SERIES_FILLS = ['bg-foreground', 'bg-muted-foreground', 'bg-muted-foreground/45'] as const;

const TRACK = 'flex w-full overflow-hidden rounded-full bg-track';
const SEGMENTED_TRACK = 'flex w-full gap-1';
const FILL =
  'block h-full rounded-full transition-[width] duration-500 ease-snap motion-reduce:transition-none';
const SEGMENT =
  'block h-full flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none';
const SKELETON_TRACK =
  'block w-full animate-pulse rounded-full bg-secondary motion-reduce:animate-none';

/** Turns an amount accepted from a template into a number, keeping `null` for "not measured". */
function nullableNumber(value: unknown): number | null {
  return value === null || value === undefined || value === '' ? null : numberAttribute(value);
}

/** Turns an optional threshold accepted from a template into a number, or `undefined` when unset. */
function optionalNumber(value: unknown): number | undefined {
  return value === null || value === undefined || value === '' ? undefined : numberAttribute(value);
}

const NUMBER = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

/** Plain French number (« 4,1 »), the default `formatAmount`. */
function formatNumber(value: number): string {
  return NUMBER.format(value);
}

/**
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  /** Measured value; `null` when not measured. With `stacked`, `null` takes the sum of `series`. */
  readonly value = input.required<number | null, unknown>({ transform: nullableNumber });
  /** Bottom of the scale. */
  readonly min = input(0, { transform: numberAttribute });
  /** Top of the scale. */
  readonly max = input(100, { transform: numberAttribute });
  /** Start of the high zone; 80 % of the range when not given. */
  readonly high = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Start of the critical zone; 95 % of the range when not given. */
  readonly critical = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** End of the low zone, the bottom of the optimum band; `min` when not given. */
  readonly low = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Ideal value; enables the optimum zone over `[low, high]`. */
  readonly optimum = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Capacity below `max`: a vertical mark, and the part over it counts as an overrun. */
  readonly threshold = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Label of the capacity mark. */
  readonly thresholdLabel = input('Capacité');
  /** Forces the zone instead of deriving it from the value (qualitative scales). */
  readonly zone = input<CwMeterZone | null>(null);
  /** Shape of the gauge. */
  readonly variant = input<CwMeterVariant>('bar');
  /** Number of blocks of a `segmented` gauge. */
  readonly segments = input(10, { transform: numberAttribute });
  /** Parts of a `stacked` gauge, three at most (the others are ignored). */
  readonly series = input<readonly CwMeterSeries[]>([]);
  /** Height of the track. */
  readonly size = input<CwMeterSize>('default');
  /** Header label and accessible name. */
  readonly label = input('');
  /** Accessible name when there is no header (« Charge de Léa Martin » in a table cell). */
  readonly ariaLabel = input('');
  /** Writes the formatted value at the right of the header. */
  readonly showValue = input(true, { transform: booleanAttribute });
  /** Text of the value, reused as `aria-valuetext`; the rounded share of the range (« 64 % »). */
  readonly format = input<CwMeterFormat | null>(null);
  /** Text of an amount on the legend and the capacity scale; a French number (« 4,1 »). */
  readonly formatAmount = input<(value: number) => string>(formatNumber);
  /** Message under the track; its icon and color come from the zone. */
  readonly note = input('');
  /** Shows the legend of a `stacked` gauge. */
  readonly showLegend = input(true, { transform: booleanAttribute });
  /** Legend label of the room left in a `stacked` gauge. */
  readonly freeLabel = input('Libre');
  /** `aria-valuetext` of a gauge without a value. */
  readonly unmeasuredText = input('Aucune mesure');
  /** Shows skeletons in place of the track and the value; `aria-busy`. */
  readonly loading = input(false, { transform: booleanAttribute });

  private readonly ids = inject(_IdGenerator);
  protected readonly labelId = this.ids.getId('cw-meter-label-');
  protected readonly noteId = this.ids.getId('cw-meter-note-');
  protected readonly segmentEmpty = `${SEGMENT} bg-track`;
  protected readonly underClasses =
    'block h-full bg-foreground transition-[width] duration-500 ease-snap motion-reduce:transition-none';
  protected readonly overClasses =
    'block h-full border-l-2 border-background bg-grenat transition-[width] duration-500 ease-snap motion-reduce:transition-none';

  /** The measured amount: `value`, or the sum of the series of a `stacked` gauge without one. */
  protected readonly total = computed(() => {
    const value = this.value();
    if (value !== null || this.variant() !== 'stacked' || this.series().length === 0) return value;
    return this.seriesSum();
  });

  protected readonly over = computed(() => {
    const total = this.total();
    const threshold = this.threshold();
    return total === null || threshold === undefined ? 0 : Math.max(0, total - threshold);
  });

  protected readonly currentZone = computed<CwMeterZone>(() => {
    const forced = this.zone();
    if (forced) return forced;
    const total = this.total();
    if (total === null) return 'normal';
    const min = this.min();
    const range = this.max() - min;
    const high = this.high() ?? min + range * 0.8;
    const critical = this.critical() ?? min + range * 0.95;
    if (this.over() > 0 || total > this.max() || total >= critical) return 'critical';
    const optimum = this.optimum();
    if (optimum !== undefined && total >= (this.low() ?? min) && total <= high) return 'optimum';
    return total >= high ? 'high' : 'normal';
  });

  protected readonly display = computed(() => {
    const total = this.total();
    if (total === null) return '—';
    const format = this.format();
    return format ? format(total, this.max()) : `${String(Math.round(this.percent(total)))} %`;
  });

  protected readonly overText = computed(() => formatNumber(this.over()));

  protected readonly valueText = computed(() => {
    if (this.total() === null) return this.unmeasuredText();
    return this.over() > 0 ? `${this.display()}, +${this.overText()}` : this.display();
  });

  protected readonly blocks = computed(() => {
    const count = Math.max(0, Math.round(this.segments()));
    const total = this.total();
    const filled = total === null ? 0 : Math.round((this.percent(total) / 100) * count);
    return Array.from({ length: count }, (_, index) => index < filled);
  });

  private readonly visibleSeries = computed(() => this.series().slice(0, SERIES_FILLS.length));

  // Rounded to absorb the binary error of decimal sums (4.1 + 2.3 is not 6.4 in floating point).
  private readonly seriesSum = computed(
    () => Math.round(this.visibleSeries().reduce((sum, part) => sum + part.value, 0) * 1e6) / 1e6,
  );

  protected readonly parts = computed(() => {
    const range = this.max() - this.min();
    return this.visibleSeries().map((part, index) => ({
      label: part.label,
      value: part.value,
      width: range > 0 ? Math.max(0, (part.value / range) * 100) : 0,
      classes: `block h-full border-r-2 border-background ${SERIES_FILLS[index] ?? ''}`,
      swatch: `size-2 shrink-0 rounded-[3px] ${SERIES_FILLS[index] ?? ''}`,
    }));
  });

  protected readonly free = computed(
    () => Math.round(Math.max(0, this.max() - this.min() - this.seriesSum()) * 1e6) / 1e6,
  );

  protected readonly overWidth = computed(() => {
    const total = this.total() ?? 0;
    return this.percent(Math.min(total, this.max())) - this.percent(this.threshold() ?? 0);
  });

  protected readonly trackClasses = computed(
    () => `${this.variant() === 'segmented' ? SEGMENTED_TRACK : TRACK} ${HEIGHTS[this.size()]}`,
  );
  protected readonly fillClasses = computed(() => `${FILL} ${ZONE_FILLS[this.currentZone()]}`);
  protected readonly segmentFilled = computed(() => `${SEGMENT} ${ZONE_FILLS[this.currentZone()]}`);
  protected readonly skeletonClasses = computed(() => `${SKELETON_TRACK} ${HEIGHTS[this.size()]}`);
  protected readonly noteClasses = computed(
    () => `mt-1.5 flex items-center gap-1 text-xs ${NOTE_TEXTS[this.currentZone()]}`,
  );
  protected readonly noteIcon = computed(() =>
    this.total() === null ? null : NOTE_ICONS[this.currentZone()],
  );

  /** Position of an amount in the range, from 0 to 100. */
  protected percent(amount: number): number {
    const min = this.min();
    const range = this.max() - min;
    if (range <= 0) return 0;
    return Math.min(100, Math.max(0, ((amount - min) / range) * 100));
  }

  protected amount(value: number): string {
    return this.formatAmount()(value);
  }
}
