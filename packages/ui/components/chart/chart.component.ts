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
  type InputSignalWithTransform,
  type InputSignal,
  type OutputEmitterRef,
  type WritableSignal,
  type Signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CwRipple, ɵFOCUS } from '@cadenway/ui/core';
import { CwSkeleton } from '@cadenway/ui/components/skeleton';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorChartBarBold } from '@ng-icons/phosphor-icons/bold';

import {
  areaPath,
  labelWidth,
  type LinePoint,
  type ValueScale,
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
/**
 * Constant FILLS
 *
 * @description
 * SVG fill classes by chart color.
 *
 * @type {Record<CwChartColor, string>}
 */
const FILLS: Record<CwChartColor, string> = {
  'chart-1': 'fill-chart-1',
  'chart-2': 'fill-chart-2',
  'chart-3': 'fill-chart-3',
  'chart-4': 'fill-chart-4',
  'chart-5': 'fill-chart-5',
};

/**
 * Constant AREAS
 *
 * @description
 * Area fill classes by chart color.
 *
 * @type {Record<CwChartColor, string>}
 */
const AREAS: Record<CwChartColor, string> = {
  'chart-1': 'fill-chart-1/10',
  'chart-2': 'fill-chart-2/10',
  'chart-3': 'fill-chart-3/10',
  'chart-4': 'fill-chart-4/10',
  'chart-5': 'fill-chart-5/10',
};

/**
 * Constant STROKES
 *
 * @description
 * SVG stroke classes by chart color.
 *
 * @type {Record<CwChartColor, string>}
 */
const STROKES: Record<CwChartColor, string> = {
  'chart-1': 'stroke-chart-1',
  'chart-2': 'stroke-chart-2',
  'chart-3': 'stroke-chart-3',
  'chart-4': 'stroke-chart-4',
  'chart-5': 'stroke-chart-5',
};

/**
 * Constant DOTS
 *
 * @description
 * Line point classes by chart color.
 *
 * @type {Record<CwChartColor, string>}
 */
const DOTS: Record<CwChartColor, string> = {
  'chart-1': 'fill-background stroke-chart-1',
  'chart-2': 'fill-background stroke-chart-2',
  'chart-3': 'fill-background stroke-chart-3',
  'chart-4': 'fill-background stroke-chart-4',
  'chart-5': 'fill-background stroke-chart-5',
};

// Legend: a square for bars and rings, a stroke for lines, dashes for a reference series.
/**
 * Constant SWATCH_BOXES
 *
 * @description
 * Legend square classes by chart color.
 *
 * @type {Record<CwChartColor, string>}
 */
const SWATCH_BOXES: Record<CwChartColor, string> = {
  'chart-1': 'size-2.5 shrink-0 rounded-[3px] bg-chart-1',
  'chart-2': 'size-2.5 shrink-0 rounded-[3px] bg-chart-2',
  'chart-3': 'size-2.5 shrink-0 rounded-[3px] bg-chart-3',
  'chart-4': 'size-2.5 shrink-0 rounded-[3px] bg-chart-4',
  'chart-5': 'size-2.5 shrink-0 rounded-[3px] bg-chart-5',
};

/**
 * Constant SWATCH_LINES
 *
 * @description
 * Legend line classes by chart color.
 *
 * @type {Record<CwChartColor, string>}
 */
const SWATCH_LINES: Record<CwChartColor, string> = {
  'chart-1': 'h-0.5 w-3 shrink-0 rounded-full bg-chart-1',
  'chart-2': 'h-0.5 w-3 shrink-0 rounded-full bg-chart-2',
  'chart-3': 'h-0.5 w-3 shrink-0 rounded-full bg-chart-3',
  'chart-4': 'h-0.5 w-3 shrink-0 rounded-full bg-chart-4',
  'chart-5': 'h-0.5 w-3 shrink-0 rounded-full bg-chart-5',
};

/**
 * Constant SWATCH_DASHES
 *
 * @description
 * Dashed legend classes by chart color.
 *
 * @type {Record<CwChartColor, string>}
 */
const SWATCH_DASHES: Record<CwChartColor, string> = {
  'chart-1': 'w-3 shrink-0 border-t-[1.5px] border-dashed border-chart-1',
  'chart-2': 'w-3 shrink-0 border-t-[1.5px] border-dashed border-chart-2',
  'chart-3': 'w-3 shrink-0 border-t-[1.5px] border-dashed border-chart-3',
  'chart-4': 'w-3 shrink-0 border-t-[1.5px] border-dashed border-chart-4',
  'chart-5': 'w-3 shrink-0 border-t-[1.5px] border-dashed border-chart-5',
};

/**
 * Constant TIP_BOXES
 *
 * @description
 * Tooltip swatch classes by chart color.
 *
 * @type {Record<CwChartColor, string>}
 */
const TIP_BOXES: Record<CwChartColor, string> = {
  'chart-1': 'size-2 shrink-0 rounded-[2px] bg-chart-1',
  'chart-2': 'size-2 shrink-0 rounded-[2px] bg-chart-2',
  'chart-3': 'size-2 shrink-0 rounded-[2px] bg-chart-3',
  'chart-4': 'size-2 shrink-0 rounded-[2px] bg-chart-4',
  'chart-5': 'size-2 shrink-0 rounded-[2px] bg-chart-5',
};

/**
 * Constant CAPACITY_SWATCH
 *
 * @description
 * Legend swatch for the capacity track.
 *
 * @type {string}
 */
const CAPACITY_SWATCH: string = 'size-2.5 shrink-0 rounded-[3px] bg-track';

// A hidden series fades its swatch and strikes its name: fading the text itself (the sheet's
// `opacity-50`) would drop it under the 4.5:1 contrast the accessibility checks require.
/**
 * Constant LEGEND_ITEM
 *
 * @description
 * Classes for an interactive legend item.
 *
 * @type {string}
 */
const LEGEND_ITEM: string =
  'relative isolate flex items-center gap-1.5 overflow-hidden rounded-sm hover:text-foreground aria-[pressed=false]:line-through aria-[pressed=false]:*:opacity-50 ' +
  ɵFOCUS;

/**
 * Constant PLOT
 *
 * @description
 * Classes for the focusable plot.
 *
 * @type {string}
 */
const PLOT: string = `relative block rounded-md ${ɵFOCUS}`;

/**
 * Constant HEIGHTS
 *
 * @description
 * Plot heights by chart size.
 *
 * @type {Record<CwChartSize, number>}
 */
const HEIGHTS: Record<CwChartSize, number> = { default: 150, sm: 120 };
/**
 * Constant EMPTY_HEIGHTS
 *
 * @description
 * Empty state classes by chart size.
 *
 * @type {Record<CwChartSize, string>}
 */
const EMPTY_HEIGHTS: Record<CwChartSize, string> = {
  default: 'flex h-[150px] flex-col items-center justify-center gap-1.5 text-center',
  sm: 'flex h-[120px] flex-col items-center justify-center gap-1.5 text-center',
};
/**
 * Constant SKELETON_HEIGHTS
 *
 * @description
 * Loading skeleton classes by chart size.
 *
 * @type {Record<CwChartSize, string>}
 */
const SKELETON_HEIGHTS: Record<CwChartSize, string> = {
  default: 'h-[150px] w-full rounded-lg',
  sm: 'h-[120px] w-full rounded-lg',
};

// Plot frame of the vertical charts (sheet preview: grid from y 6 to H − 22, labels at H − 7).
/**
 * Constant TOP
 *
 * @description
 * Top edge of the vertical plot.
 *
 * @type {number}
 */
const TOP: number = 6;
/**
 * Constant BOTTOM_GUTTER
 *
 * @description
 * Space reserved for vertical chart labels.
 *
 * @type {number}
 */
const BOTTOM_GUTTER: number = 22;
// Horizontal bars: one 28 px row per category, a 12 px bar (sheet preview).
/**
 * Constant ROW
 *
 * @description
 * Height of a horizontal chart row.
 *
 * @type {number}
 */
const ROW: number = 28;
/**
 * Constant ROW_OFFSET
 *
 * @description
 * Top offset of horizontal rows.
 *
 * @type {number}
 */
const ROW_OFFSET: number = 8;
/**
 * Constant ROW_BAR
 *
 * @description
 * Height of a horizontal bar.
 *
 * @type {number}
 */
const ROW_BAR: number = 12;
// Ring: radius 46 in a 120 unit box, 14 wide, 2.5 units between segments.
/**
 * Constant RING_RADIUS
 *
 * @description
 * Radius of the ring chart.
 *
 * @type {number}
 */
const RING_RADIUS: number = 46;
/**
 * Constant RING_LENGTH
 *
 * @description
 * Circumference of the ring chart.
 *
 * @type {number}
 */
const RING_LENGTH: number = 2 * Math.PI * RING_RADIUS;
/**
 * Constant RING_GAP
 *
 * @description
 * Spacing between ring segments.
 *
 * @type {number}
 */
const RING_GAP: number = 2.5;
// Width used until the host is measured (server rendering, test DOMs).
/**
 * Constant FALLBACK_WIDTH
 *
 * @description
 * Initial chart width before measurement.
 *
 * @type {number}
 */
const FALLBACK_WIDTH: number = 320;

/**
 * Constant NUMBER
 *
 * @description
 * French number formatter used by default.
 *
 * @type {Intl.NumberFormat}
 */
const NUMBER: Intl.NumberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

/**
 * Function formatNumber
 *
 * @description
 * Formats chart values with the default French formatter.
 *
 * @param {number} value - Value to format or constrain.
 * @returns {string} Formatted value.
 */
function formatNumber(value: number): string {
  return NUMBER.format(value);
}

/**
 * Function identity
 *
 * @description
 * Returns a category unchanged.
 *
 * @param {string} category - Category to return.
 * @returns {string} Unchanged category.
 */
function identity(category: string): string {
  return category;
}

/**
 * Function clamp
 *
 * @description
 * Restricts a number to an inclusive range.
 *
 * @param {number} value - Value to format or constrain.
 * @param {number} min - Lower bound.
 * @param {number} max - Upper bound or maximum data value.
 * @returns {number} Value constrained to the range.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Function numeric
 *
 * @description
 * Reads a finite numeric series value from a datum.
 *
 * @param {CwChartDatum} row - Datum containing the series value.
 * @param {string} key - Series key.
 * @returns {number | null} Finite numeric value, or null when unavailable.
 */
function numeric(row: CwChartDatum, key: string): number | null {
  const value: string | number | null | undefined = row[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Interface Tick
 *
 * @description
 * A labeled position on the vertical value axis.
 */
interface Tick {
  // #region Properties
  /**
   * Property y
   *
   * @description
   * Vertical position in the chart.
   *
   * @type {number}
   * @readonly
   */
  readonly y: number;

  /**
   * Property label
   *
   * @description
   * Displayed label.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;
  // #endregion
}

/**
 * Interface Category
 *
 * @description
 * Geometry and label visibility of one category.
 */
interface Category {
  // #region Properties
  /**
   * Property index
   *
   * @description
   * Index in the source data.
   *
   * @type {number}
   * @readonly
   */
  readonly index: number;

  /**
   * Property key
   *
   * @description
   * Key identifying the item.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property center
   *
   * @description
   * Horizontal center of the category.
   *
   * @type {number}
   * @readonly
   */
  readonly center: number;

  /**
   * Property bandX
   *
   * @description
   * Start of the category band.
   *
   * @type {number}
   * @readonly
   */
  readonly bandX: number;

  /**
   * Property bandWidth
   *
   * @description
   * Width of the category band.
   *
   * @type {number}
   * @readonly
   */
  readonly bandWidth: number;

  /**
   * Property showLabel
   *
   * @description
   * Whether the category label is displayed.
   *
   * @type {boolean}
   * @readonly
   */
  readonly showLabel: boolean;
  // #endregion
}

/**
 * Interface BarShape
 *
 * @description
 * SVG path and styling for a bar.
 */
interface BarShape {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Identifier for the shape.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property path
   *
   * @description
   * SVG path for the shape.
   *
   * @type {string}
   * @readonly
   */
  readonly path: string;

  /**
   * Property fill
   *
   * @description
   * Fill classes for the shape.
   *
   * @type {string}
   * @readonly
   */
  readonly fill: string;
  // #endregion
}

/**
 * Interface LineShape
 *
 * @description
 * SVG paths and styling for a line series.
 */
interface LineShape {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Key identifying the item.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property runs
   *
   * @description
   * Polyline strings for uninterrupted runs.
   *
   * @type {readonly string[]}
   * @readonly
   */
  readonly runs: readonly string[];

  /**
   * Property areas
   *
   * @description
   * SVG paths under uninterrupted runs.
   *
   * @type {readonly string[]}
   * @readonly
   */
  readonly areas: readonly string[];

  /**
   * Property stroke
   *
   * @description
   * Stroke classes for the shape.
   *
   * @type {string}
   * @readonly
   */
  readonly stroke: string;

  /**
   * Property area
   *
   * @description
   * Fill classes for the area.
   *
   * @type {string}
   * @readonly
   */
  readonly area: string;

  /**
   * Property dashed
   *
   * @description
   * Whether the series is dashed.
   *
   * @type {boolean}
   * @readonly
   */
  readonly dashed: boolean;

  /**
   * Property dot
   *
   * @description
   * Last point shown at the end of the line.
   *
   * @type {LinePoint | null}
   * @readonly
   */
  readonly dot: LinePoint | null;

  /**
   * Property dotClass
   *
   * @description
   * Classes for the line point.
   *
   * @type {string}
   * @readonly
   */
  readonly dotClass: string;
  // #endregion
}

/**
 * Interface RowShape
 *
 * @description
 * Geometry and bars for one horizontal row.
 */
interface RowShape {
  // #region Properties
  /**
   * Property index
   *
   * @description
   * Index in the source data.
   *
   * @type {number}
   * @readonly
   */
  readonly index: number;

  /**
   * Property key
   *
   * @description
   * Key identifying the item.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property y
   *
   * @description
   * Vertical position in the chart.
   *
   * @type {number}
   * @readonly
   */
  readonly y: number;

  /**
   * Property total
   *
   * @description
   * Formatted total for the row.
   *
   * @type {string}
   * @readonly
   */
  readonly total: string;

  /**
   * Property bars
   *
   * @description
   * Bar shapes in the row.
   *
   * @type {readonly BarShape[]}
   * @readonly
   */
  readonly bars: readonly BarShape[];
  // #endregion
}

/**
 * Interface Slice
 *
 * @description
 * Geometry and display data for a ring segment.
 */
interface Slice {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Key identifying the item.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property label
   *
   * @description
   * Displayed label.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property color
   *
   * @description
   * Chart color of the series.
   *
   * @type {CwChartColor}
   * @readonly
   */
  readonly color: CwChartColor;

  /**
   * Property value
   *
   * @description
   * Value associated with the item.
   *
   * @type {number}
   * @readonly
   */
  readonly value: number;

  /**
   * Property dasharray
   *
   * @description
   * SVG dash array for the ring segment.
   *
   * @type {string}
   * @readonly
   */
  readonly dasharray: string;

  /**
   * Property dashoffset
   *
   * @description
   * SVG dash offset for the ring segment.
   *
   * @type {number}
   * @readonly
   */
  readonly dashoffset: number;

  /**
   * Property stroke
   *
   * @description
   * Stroke classes for the shape.
   *
   * @type {string}
   * @readonly
   */
  readonly stroke: string;
  // #endregion
}

/**
 * Interface TooltipLine
 *
 * @description
 * One displayed series value in the tooltip.
 */
interface TooltipLine {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Key identifying the item.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property label
   *
   * @description
   * Displayed label.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property value
   *
   * @description
   * Value associated with the item.
   *
   * @type {string}
   * @readonly
   */
  readonly value: string;

  /**
   * Property swatch
   *
   * @description
   * Classes for the tooltip swatch.
   *
   * @type {string}
   * @readonly
   */
  readonly swatch: string;
  // #endregion
}

/**
 * Interface Tooltip
 *
 * @description
 * Tooltip content and position.
 */
interface Tooltip {
  // #region Properties
  /**
   * Property title
   *
   * @description
   * Tooltip title.
   *
   * @type {string}
   * @readonly
   */
  readonly title: string;

  /**
   * Property lines
   *
   * @description
   * Lines displayed in the tooltip.
   *
   * @type {readonly TooltipLine[]}
   * @readonly
   */
  readonly lines: readonly TooltipLine[];

  /**
   * Property left
   *
   * @description
   * Left offset, or null when positioned from the right.
   *
   * @type {number | null}
   * @readonly
   */
  readonly left: number | null;

  /**
   * Property right
   *
   * @description
   * Right offset, or null when positioned from the left.
   *
   * @type {number | null}
   * @readonly
   */
  readonly right: number | null;

  /**
   * Property top
   *
   * @description
   * Top offset in pixels.
   *
   * @type {number}
   * @readonly
   */
  readonly top: number;
  // #endregion
}

/**
 * Component CwChart
 *
 * @description
 * A dashboard chart drawn in SVG by Cadenway, without a third-party library: grouped or stacked bars, horizontal bars on a capacity track, lines, areas with a dashed reference, or a ring (Chart sheet of the Design System artifact). For one key figure use `cw-stat`; for exact values to compare row by row, `table[cwTable]`. `data` holds one entry per category, read by the `x` key; `series` lists the drawn keys in order, each with one of the five data colors (five series at most). The ring sums each series over `data` and shows the total with `unit` in its center. Values go through `valueFormat` (`Intl.NumberFormat('fr-FR')` by default) on the axis, the tooltip, the legend and the data table; categories through `categoryFormat` in the tooltip. Accessibility: the plot is one tab stop, a `role="img"` named by `ariaLabel` (a summary of the data); a visually hidden table repeats every value; ← → (↑ ↓ for horizontal bars), Home and End move the active category, announced politely (« S44 : Terminées 18, En retard 1 ») and shown in the tooltip; Escape closes the tooltip; Enter or a click emits `categorySelect`. The legend is a row of `aria-pressed` buttons that hide or show a series. `loading` draws skeletons with `aria-busy`; without any value, the empty state shows `emptyText`. No entry animation, the tooltip follows without transition. Style hooks: `data-type`, `data-size`, `aria-busy` on the host, `data-active` on the plot.
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
  // #region Properties
  /**
   * Property type
   *
   * @description
   * Form of the chart.
   *
   * @type {InputSignal<CwChartType>}
   * @readonly
   */
  public readonly type: InputSignal<CwChartType> = input<CwChartType>('bar');

  /**
   * Property data
   *
   * @description
   * One entry per category.
   *
   * @type {InputSignal<readonly CwChartDatum[]>}
   * @readonly
   */
  public readonly data: InputSignal<readonly CwChartDatum[]> =
    input.required<readonly CwChartDatum[]>();

  /**
   * Property x
   *
   * @description
   * Key of the category in each entry (`'week'`).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly x: InputSignal<string> = input.required<string>();

  /**
   * Property series
   *
   * @description
   * The drawn series, in order, five at most.
   *
   * @type {InputSignal<readonly CwChartSeries[]>}
   * @readonly
   */
  public readonly series: InputSignal<readonly CwChartSeries[]> =
    input.required<readonly CwChartSeries[]>();

  /**
   * Property stacked
   *
   * @description
   * Stacks the bars of a category.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly stacked: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property orientation
   *
   * @description
   * Bars as columns (`vertical`) or rows (`horizontal`).
   *
   * @type {InputSignal<CwChartOrientation>}
   * @readonly
   */
  public readonly orientation: InputSignal<CwChartOrientation> =
    input<CwChartOrientation>('vertical');

  /**
   * Property size
   *
   * @description
   * Plot height: 150 px or 120 px.
   *
   * @type {InputSignal<CwChartSize>}
   * @readonly
   */
  public readonly size: InputSignal<CwChartSize> = input<CwChartSize>('default');

  /**
   * Property legend
   *
   * @description
   * Shows the legend.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly legend: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property loading
   *
   * @description
   * Draws skeletons in place of the plot and the legend.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly loading: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property emptyText
   *
   * @description
   * Title of the empty state.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly emptyText: InputSignal<string> = input<string>('Aucune donnée sur la période');

  /**
   * Property emptyDescription
   *
   * @description
   * Second line of the empty state (« sur la période choisie »).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly emptyDescription: InputSignal<string> = input<string>('');

  /**
   * Property ariaLabel
   *
   * @description
   * Summary read by screen readers (« Tâches terminées et en retard par semaine, de S41 à S46 »).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string> = input.required<string>();

  /**
   * Property valueFormat
   *
   * @description
   * Formats the values on the axis, the tooltip, the legend and the table.
   *
   * @type {InputSignal<CwChartValueFormat>}
   * @readonly
   */
  public readonly valueFormat: InputSignal<CwChartValueFormat> =
    input<CwChartValueFormat>(formatNumber);

  /**
   * Property categoryFormat
   *
   * @description
   * Formats a category in the tooltip and the announcement.
   *
   * @type {InputSignal<CwChartCategoryFormat>}
   * @readonly
   */
  public readonly categoryFormat: InputSignal<CwChartCategoryFormat> =
    input<CwChartCategoryFormat>(identity);

  /**
   * Property categoryHeader
   *
   * @description
   * Header of the category column of the hidden data table.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly categoryHeader: InputSignal<string> = input<string>('Catégorie');

  /**
   * Property unit
   *
   * @description
   * Unit written under the total of a ring (« tâches »).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly unit: InputSignal<string> = input<string>('');

  /**
   * Property capacity
   *
   * @description
   * Capacity of horizontal bars: the full width of their track; `null` takes the largest total.
   *
   * @type {InputSignalWithTransform<number | null, unknown>}
   * @readonly
   */
  public readonly capacity: InputSignalWithTransform<number | null, unknown> = input<
    number | null,
    unknown
  >(null, {
    transform: (value: unknown) =>
      value === null || value === undefined || value === '' ? null : numberAttribute(value),
  });

  /**
   * Property capacityLabel
   *
   * @description
   * Legend label of the capacity track.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly capacityLabel: InputSignal<string> = input<string>('Capacité');

  /**
   * Property categorySelect
   *
   * @description
   * A category was clicked or chosen with Enter.
   *
   * @type {OutputEmitterRef<CwChartCategorySelect>}
   * @readonly
   */
  public readonly categorySelect: OutputEmitterRef<CwChartCategorySelect> =
    output<CwChartCategorySelect>();

  /**
   * Property host
   *
   * @description
   * Native chart element measured for layout.
   *
   * @type {HTMLElement}
   * @readonly
   */
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property width
   *
   * @description
   * Measured chart width in pixels.
   *
   * @type {WritableSignal<number>}
   * @readonly
   */
  private readonly width: WritableSignal<number> = signal(FALLBACK_WIDTH);

  /**
   * Property hidden
   *
   * @description
   * Keys of series hidden through the legend.
   *
   * @type {WritableSignal<ReadonlySet<string>>}
   * @readonly
   */
  private readonly hidden: WritableSignal<ReadonlySet<string>> = signal<ReadonlySet<string>>(
    new Set(),
  );

  /**
   * Property active
   *
   * @description
   * Index of the active category or ring segment.
   *
   * @type {WritableSignal<number | null>}
   * @readonly
   */
  protected readonly active: WritableSignal<number | null> = signal<number | null>(null);

  /**
   * Property plotClasses
   *
   * @description
   * Classes applied to the plot.
   *
   * @type {string}
   * @readonly
   */
  protected readonly plotClasses: string = PLOT;

  /**
   * Property legendItemClasses
   *
   * @description
   * Classes applied to legend controls.
   *
   * @type {string}
   * @readonly
   */
  protected readonly legendItemClasses: string = LEGEND_ITEM;

  /**
   * Property capacitySwatch
   *
   * @description
   * Classes for the capacity legend swatch.
   *
   * @type {string}
   * @readonly
   */
  protected readonly capacitySwatch: string = CAPACITY_SWATCH;

  /**
   * Property emptyClasses
   *
   * @description
   * Empty-state classes for the current size.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly emptyClasses: Signal<string> = computed(() => EMPTY_HEIGHTS[this.size()]);

  /**
   * Property skeletonClasses
   *
   * @description
   * Loading skeleton classes for the current size.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly skeletonClasses: Signal<string> = computed(
    () => SKELETON_HEIGHTS[this.size()],
  );

  /**
   * Property visibleSeries
   *
   * @description
   * Series currently visible in the plot.
   *
   * @type {Signal<CwChartSeries[]>}
   * @readonly
   */
  protected readonly visibleSeries: Signal<CwChartSeries[]> = computed(() => {
    const hidden: ReadonlySet<string> = this.hidden();
    return this.series().filter((series) => !hidden.has(series.key));
  });

  /**
   * Property empty
   *
   * @description
   * Whether the data contains no numeric series values.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly empty: Signal<boolean> = computed(() => {
    const data: readonly Readonly<Record<string, string | number | null | undefined>>[] =
      this.data();
    return !this.series().some((series) => data.some((row) => numeric(row, series.key) !== null));
  });

  /**
   * Property horizontal
   *
   * @description
   * Whether the chart displays horizontal bars.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly horizontal: Signal<boolean> = computed(
    () => this.type() === 'bar' && this.orientation() === 'horizontal',
  );

  /**
   * Property keys
   *
   * @description
   * Category keys read from the data.
   *
   * @type {Signal<string[]>}
   * @readonly
   */
  protected readonly keys: Signal<string[]> = computed(() =>
    this.data().map((row) => {
      const value: string | number | null | undefined = row[this.x()];
      return value === null || value === undefined ? '' : String(value);
    }),
  );

  /**
   * Property frame
   *
   * @description
   * The vertical frame: size, gutters and value scale of bars, lines and areas.
   *
   * @type {Signal<{ width: number; height: number; bottom: number; gutter: number; right: number; plotWidth: number; ticks: Tick[]; y: (value: number) => number; labelX: number; labelY: number; }>}
   * @readonly
   */
  protected readonly frame: Signal<{
    width: number;
    height: number;
    bottom: number;
    gutter: number;
    right: number;
    plotWidth: number;
    ticks: Tick[];
    y: (value: number) => number;
    labelX: number;
    labelY: number;
  }> = computed(() => {
    const width: number = this.width();
    const height: number = HEIGHTS[this.size()];
    const series: CwChartSeries[] = this.visibleSeries();
    const data: readonly Readonly<Record<string, string | number | null | undefined>>[] =
      this.data();
    let max: number = 0;
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
    const scale: ValueScale = niceScale(max, this.size() === 'sm' ? 2 : 3);
    const format: CwChartValueFormat = this.valueFormat();
    const labels: string[] = scale.ticks.map((tick) => format(tick));
    const gutter: number = round(Math.max(22, ...labels.map((label) => labelWidth(label) + 11)));
    const bottom: number = height - BOTTOM_GUTTER;
    const right: number = width - 2;
    const plotWidth: number = Math.max(1, right - gutter);
    const y: (value: number) => number = (value: number): number =>
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

  /**
   * Property categories
   *
   * @description
   * Category positions and label visibility.
   *
   * @type {Signal<readonly Category[]>}
   * @readonly
   */
  protected readonly categories: Signal<readonly Category[]> = computed<readonly Category[]>(() => {
    const keys: string[] = this.keys();
    const { gutter, plotWidth }: { gutter: number; plotWidth: number } = this.frame();
    const count: number = keys.length;
    const bars: boolean = this.type() === 'bar';
    const band: number = count ? plotWidth / count : plotWidth;
    const step: number = count > 1 ? plotWidth / (count - 1) : plotWidth;
    const spacing: number = bars ? band : step;
    const widest: number = Math.max(0, ...keys.map((key) => labelWidth(key))) + 6;
    const every: number = Math.max(1, Math.ceil(widest / Math.max(1, spacing)));
    return keys.map((key, index) => {
      const center: number = bars
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

  /**
   * Property bars
   *
   * @description
   * SVG paths for the vertical bars.
   *
   * @type {Signal<readonly BarShape[]>}
   * @readonly
   */
  protected readonly bars: Signal<readonly BarShape[]> = computed<readonly BarShape[]>(() => {
    if (this.type() !== 'bar' || this.horizontal()) return [];
    const { y, bottom }: { y: (value: number) => number; bottom: number } = this.frame();
    const series: CwChartSeries[] = this.visibleSeries();
    const data: readonly Readonly<Record<string, string | number | null | undefined>>[] =
      this.data();
    const shapes: BarShape[] = [];
    for (const category of this.categories()) {
      const row: Readonly<Record<string, string | number | null | undefined>> =
        data[category.index];
      if (this.stacked()) {
        const width: number = clamp(category.bandWidth * 0.5, 2, 16);
        const x: number = category.center - width / 2;
        const values: { item: CwChartSeries; value: number }[] = series
          .map((item) => ({ item, value: numeric(row, item.key) ?? 0 }))
          .filter((entry) => entry.value > 0);
        let sum: number = 0;
        values.forEach(({ item, value }: { item: CwChartSeries; value: number }, index) => {
          const top: number = y(sum + value);
          const height: number = y(sum) - top;
          const last: boolean = index === values.length - 1;
          shapes.push({
            id: `${category.key}:${item.key}`,
            path: roundedRect(x, top, width, height, 2, { topLeft: last, topRight: last }),
            fill: FILLS[item.color],
          });
          sum += value;
        });
      } else {
        const count: number = Math.max(1, series.length);
        const width: number = clamp((category.bandWidth * 0.8 - 2 * (count - 1)) / count, 2, 12);
        const group: number = count * width + 2 * (count - 1);
        series.forEach((item, index) => {
          const value: number | null = numeric(row, item.key);
          if (value === null || value <= 0) return;
          const x: number = category.center - group / 2 + index * (width + 2);
          const top: number = y(value);
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

  /**
   * Property lines
   *
   * @description
   * Line and area paths for visible series.
   *
   * @type {Signal<readonly LineShape[]>}
   * @readonly
   */
  protected readonly lines: Signal<readonly LineShape[]> = computed<readonly LineShape[]>(() => {
    if (this.type() !== 'line' && this.type() !== 'area') return [];
    const { y, bottom }: { y: (value: number) => number; bottom: number } = this.frame();
    const categories: readonly Category[] = this.categories();
    const data: readonly Readonly<Record<string, string | number | null | undefined>>[] =
      this.data();
    return this.visibleSeries().map((item) => {
      const points: ({ x: number; y: number } | null)[] = categories.map((category) => {
        const value: number | null = numeric(data[category.index], item.key);
        return value === null ? null : { x: category.center, y: y(value) };
      });
      const runs: LinePoint[][] = segments(points);
      const dashed: boolean = item.dashed === true;
      const last: LinePoint | null = runs.at(-1)?.at(-1) ?? null;
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

  /**
   * Property activeCategory
   *
   * @description
   * The active category of a vertical chart, for its hover band or its vertical guide.
   *
   * @type {Signal<Category | null>}
   * @readonly
   */
  protected readonly activeCategory: Signal<Category | null> = computed(() => {
    const index: number | null = this.active();
    return index === null || this.type() === 'donut' || this.horizontal()
      ? null
      : (this.categories().at(index) ?? null);
  });

  /**
   * Property activeDots
   *
   * @description
   * The marks of the active category of a line or area chart: one dot per series.
   *
   * @type {Signal<{ key: string; x: number; y: number; dotClass: string; }[]>}
   * @readonly
   */
  protected readonly activeDots: Signal<{ key: string; x: number; y: number; dotClass: string }[]> =
    computed(() => {
      const index: number | null = this.active();
      if (index === null || (this.type() !== 'line' && this.type() !== 'area')) return [];
      const category: Category | undefined = this.categories().at(index);
      const row: Readonly<Record<string, string | number | null | undefined>> | undefined =
        this.data().at(index);
      if (!category || !row) return [];
      const { y }: { y: (value: number) => number } = this.frame();
      return this.visibleSeries().flatMap((item) => {
        const value: number | null = numeric(row, item.key);
        return value === null
          ? []
          : [{ key: item.key, x: category.center, y: y(value), dotClass: DOTS[item.color] }];
      });
    });

  /**
   * Property rows
   *
   * @description
   * Horizontal bars: one row per category, stacked series on a capacity track.
   *
   * @type {Signal<{ width: number; height: number; labelColumn: number; track: number; shapes: RowShape[]; } | null>}
   * @readonly
   */
  protected readonly rows: Signal<{
    width: number;
    height: number;
    labelColumn: number;
    track: number;
    shapes: RowShape[];
  } | null> = computed(() => {
    if (!this.horizontal()) return null;
    const width: number = this.width();
    const keys: string[] = this.keys();
    const data: readonly Readonly<Record<string, string | number | null | undefined>>[] =
      this.data();
    const series: CwChartSeries[] = this.visibleSeries();
    const format: CwChartValueFormat = this.valueFormat();
    const totals: number[] = data.map((row) =>
      series.reduce((sum, item) => sum + Math.max(0, numeric(row, item.key) ?? 0), 0),
    );
    const totalLabels: string[] = totals.map((total) => format(total));
    const valueWidth: number = Math.max(16, ...totalLabels.map((label) => labelWidth(label) + 10));
    const labelColumn: number = clamp(
      Math.max(0, ...keys.map((key) => labelWidth(key))) + 8,
      40,
      120,
    );
    const track: number = Math.max(1, width - labelColumn - valueWidth);
    const max: number = this.capacity() ?? (Math.max(0, ...totals) || 1);
    const shapes: RowShape[] = keys.map((key, index) => {
      const top: number = ROW_OFFSET + index * ROW;
      const values: { item: CwChartSeries; value: number }[] = series
        .map((item) => ({ item, value: Math.max(0, numeric(data[index], item.key) ?? 0) }))
        .filter((entry) => entry.value > 0);
      let x: number = labelColumn;
      const bars: { id: string; path: string; fill: string }[] = values.map(
        ({ item, value }: { item: CwChartSeries; value: number }, position) => {
          const length: number = Math.min((value / max) * track, labelColumn + track - x);
          const first: boolean = position === 0;
          const last: boolean = position === values.length - 1;
          const path: string = roundedRect(x, top, Math.max(0, length), ROW_BAR, 3, {
            topLeft: first,
            bottomLeft: first,
            topRight: last,
            bottomRight: last,
          });
          x += length;
          return { id: `${key}:${item.key}`, path, fill: FILLS[item.color] };
        },
      );
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

  /**
   * Property ring
   *
   * @description
   * The ring: one segment per visible series, summed over `data`.
   *
   * @type {Signal<{ slices: Slice[]; total: string; } | null>}
   * @readonly
   */
  protected readonly ring: Signal<{ slices: Slice[]; total: string } | null> = computed(() => {
    if (this.type() !== 'donut') return null;
    const data: readonly Readonly<Record<string, string | number | null | undefined>>[] =
      this.data();
    const values: { item: CwChartSeries; value: number }[] = this.visibleSeries()
      .map((item) => ({
        item,
        value: data.reduce((sum, row) => sum + Math.max(0, numeric(row, item.key) ?? 0), 0),
      }))
      .filter((entry) => entry.value > 0);
    const total: number = values.reduce((sum, entry) => sum + entry.value, 0);
    const gap: number = values.length > 1 ? RING_GAP : 0;
    let offset: number = 0;
    const slices: Slice[] = values.map(
      ({ item, value }: { item: CwChartSeries; value: number }) => {
        const share: number = total ? (value / total) * RING_LENGTH : 0;
        const length: number = Math.max(0, share - gap);
        const slice: {
          key: string;
          label: string;
          color: CwChartColor;
          value: number;
          dasharray: string;
          dashoffset: number;
          stroke: string;
        } = {
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
      },
    );
    return { slices, total: this.valueFormat()(total) };
  });

  /**
   * Property seriesTotals
   *
   * @description
   * The sum of each series over `data`, written next to the ring legend.
   *
   * @type {Signal<Map<string, string>>}
   * @readonly
   */
  protected readonly seriesTotals: Signal<Map<string, string>> = computed(() => {
    const data: readonly Readonly<Record<string, string | number | null | undefined>>[] =
      this.data();
    const format: CwChartValueFormat = this.valueFormat();
    return new Map(
      this.series().map((item) => [
        item.key,
        format(data.reduce((sum, row) => sum + (numeric(row, item.key) ?? 0), 0)),
      ]),
    );
  });

  /**
   * Property count
   *
   * @description
   * Number of selectable categories or ring segments.
   *
   * @type {Signal<number>}
   * @readonly
   */
  private readonly count: Signal<number> = computed(() =>
    this.type() === 'donut' ? (this.ring()?.slices.length ?? 0) : this.data().length,
  );

  /**
   * Property tooltip
   *
   * @description
   * Tooltip content and position for the active selection.
   *
   * @type {Signal<Tooltip | null>}
   * @readonly
   */
  protected readonly tooltip: Signal<Tooltip | null> = computed<Tooltip | null>(() => {
    const index: number | null = this.active();
    if (index === null) return null;
    const format: CwChartValueFormat = this.valueFormat();
    const ring: { slices: Slice[]; total: string } | null = this.ring();
    if (ring) {
      const slice: Slice | undefined = ring.slices.at(index);
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
    const row: Readonly<Record<string, string | number | null | undefined>> | undefined =
      this.data().at(index);
    const key: string | undefined = this.keys().at(index);
    if (!row || key === undefined) return null;
    const lines: { key: string; label: string; value: string; swatch: string }[] =
      this.visibleSeries().map((item) => {
        const value: number | null = numeric(row, item.key);
        return {
          key: item.key,
          label: item.label,
          value: value === null ? '—' : format(value),
          swatch: item.dashed ? SWATCH_DASHES[item.color] : TIP_BOXES[item.color],
        };
      });
    const title: string = this.categoryFormat()(key);
    const rows: {
      width: number;
      height: number;
      labelColumn: number;
      track: number;
      shapes: RowShape[];
    } | null = this.rows();
    if (rows) {
      const shape: RowShape = rows.shapes[index];
      return { title, lines, left: rows.labelColumn, right: null, top: shape.y + ROW_BAR + 6 };
    }
    const center: number = this.categories()[index].center;
    const width: number = this.width();
    return center > width / 2
      ? { title, lines, left: null, right: round(width - center + 8), top: 0 }
      : { title, lines, left: round(center + 8), right: null, top: 0 };
  });

  /**
   * Property announcement
   *
   * @description
   * The polite announcement of the active category.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly announcement: Signal<string> = computed(() => {
    const tooltip: Tooltip | null = this.tooltip();
    if (!tooltip) return '';
    const values: string = tooltip.lines.map((line) => `${line.label} ${line.value}`).join(', ');
    return `${tooltip.title} : ${values}`;
  });

  /**
   * Property activeKey
   *
   * @description
   * Key of the active category or ring segment.
   *
   * @type {Signal<string | null>}
   * @readonly
   */
  protected readonly activeKey: Signal<string | null> = computed(() => {
    const index: number | null = this.active();
    if (index === null) return null;
    return this.type() === 'donut'
      ? (this.ring()?.slices.at(index)?.key ?? null)
      : (this.keys().at(index) ?? null);
  });

  /**
   * Property table
   *
   * @description
   * Formatted rows for the accessible data table.
   *
   * @type {Signal<{ key: string; label: string; cells: { key: string; value: string; }[]; }[]>}
   * @readonly
   */
  protected readonly table: Signal<
    { key: string; label: string; cells: { key: string; value: string }[] }[]
  > = computed(() => {
    const format: CwChartValueFormat = this.valueFormat();
    const categoryFormat: CwChartCategoryFormat = this.categoryFormat();
    const keys: string[] = this.keys();
    return this.data().map((row, index) => ({
      key: keys[index],
      label: categoryFormat(keys[index]),
      cells: this.series().map((item) => {
        const value: number | null = numeric(row, item.key);
        return { key: item.key, value: value === null ? '—' : format(value) };
      }),
    }));
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Measures the host after rendering and disconnects the observer on destruction.
   *
   * @constructor
   */
  public constructor() {
    const destroyRef: DestroyRef = inject(DestroyRef);
    // The SVG is drawn at its real width (viewBox = measured pixels), so the 10 px labels keep their
    // size whatever the card width, instead of scaling with a fixed viewBox.
    afterNextRender(() => {
      this.measure();
      const view: (Window & typeof globalThis) | null = this.host.ownerDocument.defaultView;
      if (typeof view?.ResizeObserver !== 'function') return;
      const observer: ResizeObserver = new view.ResizeObserver(() => {
        this.measure();
      });
      observer.observe(this.host);
      destroyRef.onDestroy(() => {
        observer.disconnect();
      });
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method isVisible
   *
   * @description
   * Checks whether a series is visible.
   *
   * @param {string} key - Series key.
   * @returns {boolean} Whether the series is visible.
   */
  protected isVisible(key: string): boolean {
    return !this.hidden().has(key);
  }

  /**
   * Method swatch
   *
   * @description
   * Selects legend swatch classes for a series.
   *
   * @param {CwChartSeries} item - Series to display.
   * @returns {string} Classes for the series legend swatch.
   */
  protected swatch(item: CwChartSeries): string {
    if (item.dashed) return SWATCH_DASHES[item.color];
    return this.type() === 'line' || this.type() === 'area'
      ? SWATCH_LINES[item.color]
      : SWATCH_BOXES[item.color];
  }

  /**
   * Method toggleSeries
   *
   * @description
   * Toggles visibility of a series and clears the active selection.
   *
   * @param {string} key - Series key.
   */
  protected toggleSeries(key: string): void {
    this.hidden.update((hidden) => {
      const next: Set<string> = new Set<string>(hidden);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    this.active.set(null);
  }

  /**
   * Method onPointerMove
   *
   * @description
   * Updates the active category from pointer position.
   *
   * @param {PointerEvent} event - Pointer or keyboard event.
   */
  protected onPointerMove(event: PointerEvent): void {
    if (this.type() === 'donut') return;
    const target: HTMLElement = event.currentTarget as HTMLElement;
    const rect: DOMRect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const count: number = this.count();
    if (count === 0) return;
    const rows: {
      width: number;
      height: number;
      labelColumn: number;
      track: number;
      shapes: RowShape[];
    } | null = this.rows();
    let index: number;
    if (rows) {
      const y: number = ((event.clientY - rect.top) * rows.height) / rect.height;
      index = Math.floor((y - ROW_OFFSET / 2) / ROW);
    } else {
      const { gutter, width }: { gutter: number; width: number } = this.frame();
      const x: number = ((event.clientX - rect.left) * width) / rect.width;
      const category: Category = this.categories()[0];
      index =
        this.type() === 'bar'
          ? Math.floor((x - gutter) / category.bandWidth)
          : Math.round((x - gutter) / (count > 1 ? category.bandWidth : Infinity));
    }
    this.active.set(index >= 0 && index < count ? index : null);
  }

  /**
   * Method onSliceEnter
   *
   * @description
   * Activates a ring segment under the pointer.
   *
   * @param {number} index - Index of the category or segment.
   */
  protected onSliceEnter(index: number): void {
    this.active.set(index);
  }

  /**
   * Method onPointerLeave
   *
   * @description
   * Clears the active selection when the pointer leaves.
   */
  protected onPointerLeave(): void {
    this.active.set(null);
  }

  /**
   * Method onClick
   *
   * @description
   * Emits the active selection when the plot is clicked.
   */
  protected onClick(): void {
    const index: number | null = this.active();
    if (index !== null) this.select(index);
  }

  /**
   * Method onKeydown
   *
   * @description
   * Moves, selects or clears the active category using the keyboard.
   *
   * @param {KeyboardEvent} event - Pointer or keyboard event.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const count: number = this.count();
    if (count === 0) return;
    const current: number | null = this.active();
    // Rows of horizontal bars also follow ↑ ↓, the direction they are stacked in.
    const rowsKeys: boolean = this.horizontal();
    const key: string = event.key;
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

  /**
   * Method select
   *
   * @description
   * Emits the selected category and its numeric values.
   *
   * @param {number} index - Index of the category or segment.
   */
  private select(index: number): void {
    const values: Record<string, number> = {};
    if (this.type() === 'donut') {
      const slice: Slice | undefined = this.ring()?.slices.at(index);
      if (!slice) return;
      values[slice.key] = slice.value;
      this.categorySelect.emit({ x: slice.key, values });
      return;
    }
    const row: Readonly<Record<string, string | number | null | undefined>> | undefined =
      this.data().at(index);
    if (!row) return;
    for (const item of this.series()) {
      const value: number | null = numeric(row, item.key);
      if (value !== null) values[item.key] = value;
    }
    this.categorySelect.emit({ x: this.keys()[index], values });
  }

  /**
   * Method measure
   *
   * @description
   * Measures the chart host width.
   */
  private measure(): void {
    const width: number = Math.round(this.host.clientWidth);
    if (width > 0) this.width.set(width);
  }
  // #endregion
}
