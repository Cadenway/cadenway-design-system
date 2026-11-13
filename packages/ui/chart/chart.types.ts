/** Form of a chart: vertical or horizontal bars, lines, lines with their area, or a ring. */
export type CwChartType = 'bar' | 'line' | 'area' | 'donut';

/** The five data colors, in this order; no other color is allowed in a chart. */
export type CwChartColor = 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5';

/** Direction of the bars: one column per category, or one row per category. */
export type CwChartOrientation = 'vertical' | 'horizontal';

/** Height of the plot: 150 px (`default`) or 120 px (`sm`). */
export type CwChartSize = 'sm' | 'default';

/**
 * One series drawn by a chart: `key` reads its value in each entry of `data`, `label` names it in
 * the legend, the tooltip and the data table. `dashed` draws a reference series (ideal, target) as
 * a dashed line, without area or end dot.
 */
export interface CwChartSeries {
  readonly key: string;
  readonly label: string;
  readonly color: CwChartColor;
  readonly dashed?: boolean;
}

/**
 * One entry of `data`: the category under the `x` key (« S45 »), and one value per series key. A
 * missing or non-numeric value is a gap: no bar, a break in the line.
 */
export type CwChartDatum = Readonly<Record<string, number | string | null | undefined>>;

/** Formats a value for the axis, the tooltip, the legend and the data table. */
export type CwChartValueFormat = (value: number) => string;

/** Formats a category for the tooltip title and the announcement (« S45 » → « Semaine 45 »). */
export type CwChartCategoryFormat = (category: string) => string;

/** Emitted when a category is clicked or chosen with Enter: its key and the values of its series. */
export interface CwChartCategorySelect {
  readonly x: string;
  readonly values: Readonly<Record<string, number>>;
}
