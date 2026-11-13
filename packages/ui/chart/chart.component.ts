import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CwRipple, ɵFOCUS } from '@cadenway/ui/core';
import { CwSkeleton } from '@cadenway/ui/skeleton';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorChartBarBold } from '@ng-icons/phosphor-icons/bold';

import {
  areaPath,
  labelWidth,
  type LinePoint,
  niceScale,
  polyline,
  round,
  roundedRect,
  segments,
} from './chart.geometry';
import type {
  CwChartCategoryFormat,
  CwChartCategorySelect,
  CwChartColor,
  CwChartDatum,
  CwChartOrientation,
  CwChartSeries,
  CwChartSize,
  CwChartType,
  CwChartValueFormat,
} from './chart.types';

/* Literal class strings, one per data color (Chart sheet and preview of the Design System
   artifact), so Tailwind finds them in the compiled package. Colors come from `chart-1` … `chart-5`
   only. */
const FILLS: Record<CwChartColor, string> = {
  'chart-1': 'fill-chart-1',
  'chart-2': 'fill-chart-2',
  'chart-3': 'fill-chart-3',
  'chart-4': 'fill-chart-4',
  'chart-5': 'fill-chart-5',
};

const AREAS: Record<CwChartColor, string> = {
  'chart-1': 'fill-chart-1/10',
  'chart-2': 'fill-chart-2/10',
  'chart-3': 'fill-chart-3/10',
  'chart-4': 'fill-chart-4/10',
  'chart-5': 'fill-chart-5/10',
};

const STROKES: Record<CwChartColor, string> = {
  'chart-1': 'stroke-chart-1',
  'chart-2': 'stroke-chart-2',
  'chart-3': 'stroke-chart-3',
  'chart-4': 'stroke-chart-4',
  'chart-5': 'stroke-chart-5',
};

const DOTS: Record<CwChartColor, string> = {
  'chart-1': 'fill-background stroke-chart-1',
  'chart-2': 'fill-background stroke-chart-2',
  'chart-3': 'fill-background stroke-chart-3',
  'chart-4': 'fill-background stroke-chart-4',
  'chart-5': 'fill-background stroke-chart-5',
};

// Legend: a square for bars and rings, a stroke for lines, dashes for a reference series.
const SWATCH_BOXES: Record<CwChartColor, string> = {
  'chart-1': 'size-2.5 shrink-0 rounded-[3px] bg-chart-1',
  'chart-2': 'size-2.5 shrink-0 rounded-[3px] bg-chart-2',
  'chart-3': 'size-2.5 shrink-0 rounded-[3px] bg-chart-3',
  'chart-4': 'size-2.5 shrink-0 rounded-[3px] bg-chart-4',
  'chart-5': 'size-2.5 shrink-0 rounded-[3px] bg-chart-5',
};

const SWATCH_LINES: Record<CwChartColor, string> = {
  'chart-1': 'h-0.5 w-3 shrink-0 rounded-full bg-chart-1',
  'chart-2': 'h-0.5 w-3 shrink-0 rounded-full bg-chart-2',
  'chart-3': 'h-0.5 w-3 shrink-0 rounded-full bg-chart-3',
  'chart-4': 'h-0.5 w-3 shrink-0 rounded-full bg-chart-4',
  'chart-5': 'h-0.5 w-3 shrink-0 rounded-full bg-chart-5',
};

const SWATCH_DASHES: Record<CwChartColor, string> = {
  'chart-1': 'w-3 shrink-0 border-t-[1.5px] border-dashed border-chart-1',
  'chart-2': 'w-3 shrink-0 border-t-[1.5px] border-dashed border-chart-2',
  'chart-3': 'w-3 shrink-0 border-t-[1.5px] border-dashed border-chart-3',
  'chart-4': 'w-3 shrink-0 border-t-[1.5px] border-dashed border-chart-4',
  'chart-5': 'w-3 shrink-0 border-t-[1.5px] border-dashed border-chart-5',
};

const TIP_BOXES: Record<CwChartColor, string> = {
  'chart-1': 'size-2 shrink-0 rounded-[2px] bg-chart-1',
  'chart-2': 'size-2 shrink-0 rounded-[2px] bg-chart-2',
  'chart-3': 'size-2 shrink-0 rounded-[2px] bg-chart-3',
  'chart-4': 'size-2 shrink-0 rounded-[2px] bg-chart-4',
  'chart-5': 'size-2 shrink-0 rounded-[2px] bg-chart-5',
};

const CAPACITY_SWATCH = 'size-2.5 shrink-0 rounded-[3px] bg-track';

// A hidden series fades its swatch and strikes its name: fading the text itself (the sheet's
// `opacity-50`) would drop it under the 4.5:1 contrast the accessibility checks require.
const LEGEND_ITEM =
  'relative isolate flex items-center gap-1.5 overflow-hidden rounded-sm hover:text-foreground aria-[pressed=false]:line-through aria-[pressed=false]:*:opacity-50 ' +
  ɵFOCUS;

const PLOT = `relative block rounded-md ${ɵFOCUS}`;

const HEIGHTS: Record<CwChartSize, number> = { default: 150, sm: 120 };
const EMPTY_HEIGHTS: Record<CwChartSize, string> = {
  default: 'flex h-[150px] flex-col items-center justify-center gap-1.5 text-center',
  sm: 'flex h-[120px] flex-col items-center justify-center gap-1.5 text-center',
};
const SKELETON_HEIGHTS: Record<CwChartSize, string> = {
  default: 'h-[150px] w-full rounded-lg',
  sm: 'h-[120px] w-full rounded-lg',
};

// Plot frame of the vertical charts (sheet preview: grid from y 6 to H − 22, labels at H − 7).
const TOP = 6;
const BOTTOM_GUTTER = 22;
// Horizontal bars: one 28 px row per category, a 12 px bar (sheet preview).
const ROW = 28;
const ROW_OFFSET = 8;
const ROW_BAR = 12;
// Ring: radius 46 in a 120 unit box, 14 wide, 2.5 units between segments.
const RING_RADIUS = 46;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const RING_GAP = 2.5;
// Width used until the host is measured (server rendering, test DOMs).
const FALLBACK_WIDTH = 320;

const NUMBER = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

function formatNumber(value: number): string {
  return NUMBER.format(value);
}

function identity(category: string): string {
  return category;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function numeric(row: CwChartDatum, key: string): number | null {
  const value = row[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

interface Tick {
  readonly y: number;
  readonly label: string;
}

interface Category {
  readonly index: number;
  readonly key: string;
  readonly center: number;
  readonly bandX: number;
  readonly bandWidth: number;
  readonly showLabel: boolean;
}

interface BarShape {
  readonly id: string;
  readonly path: string;
  readonly fill: string;
}

interface LineShape {
  readonly key: string;
  readonly runs: readonly string[];
  readonly areas: readonly string[];
  readonly stroke: string;
  readonly area: string;
  readonly dashed: boolean;
  readonly dot: LinePoint | null;
  readonly dotClass: string;
}

interface RowShape {
  readonly index: number;
  readonly key: string;
  readonly y: number;
  readonly total: string;
  readonly bars: readonly BarShape[];
}

interface Slice {
  readonly key: string;
  readonly label: string;
  readonly color: CwChartColor;
  readonly value: number;
  readonly dasharray: string;
  readonly dashoffset: number;
  readonly stroke: string;
}

interface TooltipLine {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly swatch: string;
}

interface Tooltip {
  readonly title: string;
  readonly lines: readonly TooltipLine[];
  readonly left: number | null;
  readonly right: number | null;
  readonly top: number;
}

/**
 * A dashboard chart drawn in SVG by Cadenway, without a third-party library: grouped or stacked
 * bars, horizontal bars on a capacity track, lines, areas with a dashed reference, or a ring
 * (Chart sheet of the Design System artifact). For one key figure use `cw-stat`; for exact values
 * to compare row by row, `table[cwTable]`.
 *
 * `data` holds one entry per category, read by the `x` key; `series` lists the drawn keys in order,
 * each with one of the five data colors (five series at most). The ring sums each series over
 * `data` and shows the total with `unit` in its center. Values go through `valueFormat`
 * (`Intl.NumberFormat('fr-FR')` by default) on the axis, the tooltip, the legend and the data table;
 * categories through `categoryFormat` in the tooltip.
 *
 * Accessibility: the plot is one tab stop, a `role="img"` named by `ariaLabel` (a summary of the
 * data); a visually hidden table repeats every value; ← → (↑ ↓ for horizontal bars), Home and End
 * move the active category, announced politely (« S44 : Terminées 18, En retard 1 ») and shown in
 * the tooltip; Escape closes the tooltip; Enter or a click emits `categorySelect`. The legend is a
 * row of `aria-pressed` buttons that hide or show a series. `loading` draws skeletons with
 * `aria-busy`; without any value, the empty state shows `emptyText`. No entry animation, the
 * tooltip follows without transition. Style hooks: `data-type`, `data-size`, `aria-busy` on the
 * host, `data-active` on the plot.
 */
@Component({
  selector: 'cw-chart',
  imports: [NgIcon, NgTemplateOutlet, CwRipple, CwSkeleton],
  providers: [provideIcons({ phosphorChartBarBold })],
  host: {
    class: 'flex min-w-0 flex-col gap-3',
    '[attr.data-type]': 'type()',
    '[attr.data-size]': 'size()',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  templateUrl: './chart.component.html',
})
export class CwChart {
  /** Form of the chart. */
  readonly type = input<CwChartType>('bar');
  /** One entry per category. */
  readonly data = input.required<readonly CwChartDatum[]>();
  /** Key of the category in each entry (`'week'`). */
  readonly x = input.required<string>();
  /** The drawn series, in order, five at most. */
  readonly series = input.required<readonly CwChartSeries[]>();
  /** Stacks the bars of a category. */
  readonly stacked = input(false, { transform: booleanAttribute });
  /** Bars as columns (`vertical`) or rows (`horizontal`). */
  readonly orientation = input<CwChartOrientation>('vertical');
  /** Plot height: 150 px or 120 px. */
  readonly size = input<CwChartSize>('default');
  /** Shows the legend. */
  readonly legend = input(true, { transform: booleanAttribute });
  /** Draws skeletons in place of the plot and the legend. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Title of the empty state. */
  readonly emptyText = input<string>('Aucune donnée sur la période');
  /** Second line of the empty state (« sur la période choisie »). */
  readonly emptyDescription = input<string>('');
  /** Summary read by screen readers (« Tâches terminées et en retard par semaine, de S41 à S46 »). */
  readonly ariaLabel = input.required<string>();
  /** Formats the values on the axis, the tooltip, the legend and the table. */
  readonly valueFormat = input<CwChartValueFormat>(formatNumber);
  /** Formats a category in the tooltip and the announcement. */
  readonly categoryFormat = input<CwChartCategoryFormat>(identity);
  /** Header of the category column of the hidden data table. */
  readonly categoryHeader = input<string>('Catégorie');
  /** Unit written under the total of a ring (« tâches »). */
  readonly unit = input<string>('');
  /** Capacity of horizontal bars: the full width of their track; `null` takes the largest total. */
  readonly capacity = input<number | null, unknown>(null, {
    transform: (value: unknown) =>
      value === null || value === undefined || value === '' ? null : numberAttribute(value),
  });
  /** Legend label of the capacity track. */
  readonly capacityLabel = input<string>('Capacité');

  /** A category was clicked or chosen with Enter. */
  readonly categorySelect = output<CwChartCategorySelect>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private readonly width = signal(FALLBACK_WIDTH);
  private readonly hidden = signal<ReadonlySet<string>>(new Set());
  protected readonly active = signal<number | null>(null);

  protected readonly plotClasses = PLOT;
  protected readonly legendItemClasses = LEGEND_ITEM;
  protected readonly capacitySwatch = CAPACITY_SWATCH;
  protected readonly emptyClasses = computed(() => EMPTY_HEIGHTS[this.size()]);
  protected readonly skeletonClasses = computed(() => SKELETON_HEIGHTS[this.size()]);

  protected readonly visibleSeries = computed(() => {
    const hidden = this.hidden();
    return this.series().filter((series) => !hidden.has(series.key));
  });

  protected readonly empty = computed(() => {
    const data = this.data();
    return !this.series().some((series) => data.some((row) => numeric(row, series.key) !== null));
  });

  protected readonly horizontal = computed(
    () => this.type() === 'bar' && this.orientation() === 'horizontal',
  );

  protected readonly keys = computed(() =>
    this.data().map((row) => {
      const value = row[this.x()];
      return value === null || value === undefined ? '' : String(value);
    }),
  );

  /** The vertical frame: size, gutters and value scale of bars, lines and areas. */
  protected readonly frame = computed(() => {
    const width = this.width();
    const height = HEIGHTS[this.size()];
    const series = this.visibleSeries();
    const data = this.data();
    let max = 0;
    for (const row of data) {
      if (this.type() === 'bar' && this.stacked()) {
        max = Math.max(
          max,
          series.reduce((sum, item) => sum + Math.max(0, numeric(row, item.key) ?? 0), 0),
        );
      } else {
        for (const item of series) max = Math.max(max, numeric(row, item.key) ?? 0);
      }
    }
    const scale = niceScale(max, this.size() === 'sm' ? 2 : 3);
    const format = this.valueFormat();
    const labels = scale.ticks.map((tick) => format(tick));
    const gutter = round(Math.max(22, ...labels.map((label) => labelWidth(label) + 11)));
    const bottom = height - BOTTOM_GUTTER;
    const right = width - 2;
    const plotWidth = Math.max(1, right - gutter);
    const y = (value: number): number =>
      round(bottom - (Math.max(0, value) / scale.max) * (bottom - TOP));
    const ticks: Tick[] = scale.ticks.map((tick, index) => ({ y: y(tick), label: labels[index] }));
    return {
      width,
      height,
      bottom,
      gutter,
      right,
      plotWidth,
      ticks,
      y,
      labelX: gutter - 5,
      labelY: height - 7,
    };
  });

  protected readonly categories = computed<readonly Category[]>(() => {
    const keys = this.keys();
    const { gutter, plotWidth } = this.frame();
    const count = keys.length;
    const bars = this.type() === 'bar';
    const band = count ? plotWidth / count : plotWidth;
    const step = count > 1 ? plotWidth / (count - 1) : plotWidth;
    const spacing = bars ? band : step;
    const widest = Math.max(0, ...keys.map((key) => labelWidth(key))) + 6;
    const every = Math.max(1, Math.ceil(widest / Math.max(1, spacing)));
    return keys.map((key, index) => {
      const center = bars
        ? gutter + band * (index + 0.5)
        : count > 1
          ? gutter + index * step
          : gutter + plotWidth / 2;
      return {
        index,
        key,
        center: round(center),
        bandX: round(bars ? gutter + band * index : center - step / 2),
        bandWidth: round(bars ? band : step),
        showLabel: index % every === 0,
      };
    });
  });

  protected readonly bars = computed<readonly BarShape[]>(() => {
    if (this.type() !== 'bar' || this.horizontal()) return [];
    const { y, bottom } = this.frame();
    const series = this.visibleSeries();
    const data = this.data();
    const shapes: BarShape[] = [];
    for (const category of this.categories()) {
      const row = data[category.index];
      if (this.stacked()) {
        const width = clamp(category.bandWidth * 0.5, 2, 16);
        const x = category.center - width / 2;
        const values = series
          .map((item) => ({ item, value: numeric(row, item.key) ?? 0 }))
          .filter((entry) => entry.value > 0);
        let sum = 0;
        values.forEach(({ item, value }, index) => {
          const top = y(sum + value);
          const height = y(sum) - top;
          const last = index === values.length - 1;
          shapes.push({
            id: `${category.key}:${item.key}`,
            path: roundedRect(x, top, width, height, 2, { topLeft: last, topRight: last }),
            fill: FILLS[item.color],
          });
          sum += value;
        });
      } else {
        const count = Math.max(1, series.length);
        const width = clamp((category.bandWidth * 0.8 - 2 * (count - 1)) / count, 2, 12);
        const group = count * width + 2 * (count - 1);
        series.forEach((item, index) => {
          const value = numeric(row, item.key);
          if (value === null || value <= 0) return;
          const x = category.center - group / 2 + index * (width + 2);
          const top = y(value);
          shapes.push({
            id: `${category.key}:${item.key}`,
            path: roundedRect(x, top, width, bottom - top, 2, { topLeft: true, topRight: true }),
            fill: FILLS[item.color],
          });
        });
      }
    }
    return shapes;
  });

  protected readonly lines = computed<readonly LineShape[]>(() => {
    if (this.type() !== 'line' && this.type() !== 'area') return [];
    const { y, bottom } = this.frame();
    const categories = this.categories();
    const data = this.data();
    return this.visibleSeries().map((item) => {
      const points = categories.map((category) => {
        const value = numeric(data[category.index], item.key);
        return value === null ? null : { x: category.center, y: y(value) };
      });
      const runs = segments(points);
      const dashed = item.dashed === true;
      const last = runs.at(-1)?.at(-1) ?? null;
      return {
        key: item.key,
        runs: runs.map((run) => polyline(run)),
        areas: this.type() === 'area' && !dashed ? runs.map((run) => areaPath(run, bottom)) : [],
        stroke: STROKES[item.color],
        area: AREAS[item.color],
        dashed,
        dot: dashed ? null : last,
        dotClass: DOTS[item.color],
      };
    });
  });

  /** The active category of a vertical chart, for its hover band or its vertical guide. */
  protected readonly activeCategory = computed(() => {
    const index = this.active();
    return index === null || this.type() === 'donut' || this.horizontal()
      ? null
      : (this.categories().at(index) ?? null);
  });

  /** The marks of the active category of a line or area chart: one dot per series. */
  protected readonly activeDots = computed(() => {
    const index = this.active();
    if (index === null || (this.type() !== 'line' && this.type() !== 'area')) return [];
    const category = this.categories().at(index);
    const row = this.data().at(index);
    if (!category || !row) return [];
    const { y } = this.frame();
    return this.visibleSeries().flatMap((item) => {
      const value = numeric(row, item.key);
      return value === null
        ? []
        : [{ key: item.key, x: category.center, y: y(value), dotClass: DOTS[item.color] }];
    });
  });

  /** Horizontal bars: one row per category, stacked series on a capacity track. */
  protected readonly rows = computed(() => {
    if (!this.horizontal()) return null;
    const width = this.width();
    const keys = this.keys();
    const data = this.data();
    const series = this.visibleSeries();
    const format = this.valueFormat();
    const totals = data.map((row) =>
      series.reduce((sum, item) => sum + Math.max(0, numeric(row, item.key) ?? 0), 0),
    );
    const totalLabels = totals.map((total) => format(total));
    const valueWidth = Math.max(16, ...totalLabels.map((label) => labelWidth(label) + 10));
    const labelColumn = clamp(Math.max(0, ...keys.map((key) => labelWidth(key))) + 8, 40, 120);
    const track = Math.max(1, width - labelColumn - valueWidth);
    const max = this.capacity() ?? (Math.max(0, ...totals) || 1);
    const shapes: RowShape[] = keys.map((key, index) => {
      const top = ROW_OFFSET + index * ROW;
      const values = series
        .map((item) => ({ item, value: Math.max(0, numeric(data[index], item.key) ?? 0) }))
        .filter((entry) => entry.value > 0);
      let x = labelColumn;
      const bars = values.map(({ item, value }, position) => {
        const length = Math.min((value / max) * track, labelColumn + track - x);
        const first = position === 0;
        const last = position === values.length - 1;
        const path = roundedRect(x, top, Math.max(0, length), ROW_BAR, 3, {
          topLeft: first,
          bottomLeft: first,
          topRight: last,
          bottomRight: last,
        });
        x += length;
        return { id: `${key}:${item.key}`, path, fill: FILLS[item.color] };
      });
      return { index, key, y: top, total: totalLabels[index], bars };
    });
    return {
      width,
      height: keys.length * ROW + ROW_OFFSET,
      labelColumn,
      track,
      shapes,
    };
  });

  /** The ring: one segment per visible series, summed over `data`. */
  protected readonly ring = computed(() => {
    if (this.type() !== 'donut') return null;
    const data = this.data();
    const values = this.visibleSeries()
      .map((item) => ({
        item,
        value: data.reduce((sum, row) => sum + Math.max(0, numeric(row, item.key) ?? 0), 0),
      }))
      .filter((entry) => entry.value > 0);
    const total = values.reduce((sum, entry) => sum + entry.value, 0);
    const gap = values.length > 1 ? RING_GAP : 0;
    let offset = 0;
    const slices: Slice[] = values.map(({ item, value }) => {
      const share = total ? (value / total) * RING_LENGTH : 0;
      const length = Math.max(0, share - gap);
      const slice = {
        key: item.key,
        label: item.label,
        color: item.color,
        value,
        dasharray: `${String(round(length))} ${String(round(RING_LENGTH - length))}`,
        dashoffset: round(-offset),
        stroke: STROKES[item.color],
      };
      offset += share;
      return slice;
    });
    return { slices, total: this.valueFormat()(total) };
  });

  /** The sum of each series over `data`, written next to the ring legend. */
  protected readonly seriesTotals = computed(() => {
    const data = this.data();
    const format = this.valueFormat();
    return new Map(
      this.series().map((item) => [
        item.key,
        format(data.reduce((sum, row) => sum + (numeric(row, item.key) ?? 0), 0)),
      ]),
    );
  });

  private readonly count = computed(() =>
    this.type() === 'donut' ? (this.ring()?.slices.length ?? 0) : this.data().length,
  );

  protected readonly tooltip = computed<Tooltip | null>(() => {
    const index = this.active();
    if (index === null) return null;
    const format = this.valueFormat();
    const ring = this.ring();
    if (ring) {
      const slice = ring.slices.at(index);
      if (!slice) return null;
      return {
        title: slice.label,
        lines: [
          {
            key: slice.key,
            label: slice.label,
            value: format(slice.value),
            swatch: TIP_BOXES[slice.color],
          },
        ],
        left: 112,
        right: null,
        top: 0,
      };
    }
    const row = this.data().at(index);
    const key = this.keys().at(index);
    if (!row || key === undefined) return null;
    const lines = this.visibleSeries().map((item) => {
      const value = numeric(row, item.key);
      return {
        key: item.key,
        label: item.label,
        value: value === null ? '—' : format(value),
        swatch: item.dashed ? SWATCH_DASHES[item.color] : TIP_BOXES[item.color],
      };
    });
    const title = this.categoryFormat()(key);
    const rows = this.rows();
    if (rows) {
      const shape = rows.shapes[index];
      return { title, lines, left: rows.labelColumn, right: null, top: shape.y + ROW_BAR + 6 };
    }
    const center = this.categories()[index].center;
    const width = this.width();
    return center > width / 2
      ? { title, lines, left: null, right: round(width - center + 8), top: 0 }
      : { title, lines, left: round(center + 8), right: null, top: 0 };
  });

  /** The polite announcement of the active category. */
  protected readonly announcement = computed(() => {
    const tooltip = this.tooltip();
    if (!tooltip) return '';
    const values = tooltip.lines.map((line) => `${line.label} ${line.value}`).join(', ');
    return `${tooltip.title} : ${values}`;
  });

  protected readonly activeKey = computed(() => {
    const index = this.active();
    if (index === null) return null;
    return this.type() === 'donut'
      ? (this.ring()?.slices.at(index)?.key ?? null)
      : (this.keys().at(index) ?? null);
  });

  protected readonly table = computed(() => {
    const format = this.valueFormat();
    const categoryFormat = this.categoryFormat();
    const keys = this.keys();
    return this.data().map((row, index) => ({
      key: keys[index],
      label: categoryFormat(keys[index]),
      cells: this.series().map((item) => {
        const value = numeric(row, item.key);
        return { key: item.key, value: value === null ? '—' : format(value) };
      }),
    }));
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    // The SVG is drawn at its real width (viewBox = measured pixels), so the 10 px labels keep their
    // size whatever the card width, instead of scaling with a fixed viewBox.
    afterNextRender(() => {
      this.measure();
      const view = this.host.ownerDocument.defaultView;
      if (typeof view?.ResizeObserver !== 'function') return;
      const observer = new view.ResizeObserver(() => {
        this.measure();
      });
      observer.observe(this.host);
      destroyRef.onDestroy(() => {
        observer.disconnect();
      });
    });
  }

  protected isVisible(key: string): boolean {
    return !this.hidden().has(key);
  }

  protected swatch(item: CwChartSeries): string {
    if (item.dashed) return SWATCH_DASHES[item.color];
    return this.type() === 'line' || this.type() === 'area'
      ? SWATCH_LINES[item.color]
      : SWATCH_BOXES[item.color];
  }

  protected toggleSeries(key: string): void {
    this.hidden.update((hidden) => {
      const next = new Set(hidden);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    this.active.set(null);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.type() === 'donut') return;
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const count = this.count();
    if (count === 0) return;
    const rows = this.rows();
    let index: number;
    if (rows) {
      const y = ((event.clientY - rect.top) * rows.height) / rect.height;
      index = Math.floor((y - ROW_OFFSET / 2) / ROW);
    } else {
      const { gutter, width } = this.frame();
      const x = ((event.clientX - rect.left) * width) / rect.width;
      const category = this.categories()[0];
      index =
        this.type() === 'bar'
          ? Math.floor((x - gutter) / category.bandWidth)
          : Math.round((x - gutter) / (count > 1 ? category.bandWidth : Infinity));
    }
    this.active.set(index >= 0 && index < count ? index : null);
  }

  protected onSliceEnter(index: number): void {
    this.active.set(index);
  }

  protected onPointerLeave(): void {
    this.active.set(null);
  }

  protected onClick(): void {
    const index = this.active();
    if (index !== null) this.select(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.count();
    if (count === 0) return;
    const current = this.active();
    // Rows of horizontal bars also follow ↑ ↓, the direction they are stacked in.
    const rowsKeys = this.horizontal();
    const key = event.key;
    let next: number;
    if (key === 'ArrowRight' || (rowsKeys && key === 'ArrowDown')) {
      next = current === null ? 0 : Math.min(count - 1, current + 1);
    } else if (key === 'ArrowLeft' || (rowsKeys && key === 'ArrowUp')) {
      next = current === null ? 0 : Math.max(0, current - 1);
    } else if (key === 'Home') {
      next = 0;
    } else if (key === 'End') {
      next = count - 1;
    } else if (key === 'Enter') {
      event.preventDefault();
      this.select(current ?? 0);
      return;
    } else if (key === 'Escape' && current !== null) {
      event.preventDefault();
      this.active.set(null);
      return;
    } else {
      return;
    }
    event.preventDefault();
    this.active.set(next);
  }

  private select(index: number): void {
    const values: Record<string, number> = {};
    if (this.type() === 'donut') {
      const slice = this.ring()?.slices.at(index);
      if (!slice) return;
      values[slice.key] = slice.value;
      this.categorySelect.emit({ x: slice.key, values });
      return;
    }
    const row = this.data().at(index);
    if (!row) return;
    for (const item of this.series()) {
      const value = numeric(row, item.key);
      if (value !== null) values[item.key] = value;
    }
    this.categorySelect.emit({ x: this.keys()[index], values });
  }

  private measure(): void {
    const width = Math.round(this.host.clientWidth);
    if (width > 0) this.width.set(width);
  }
}
