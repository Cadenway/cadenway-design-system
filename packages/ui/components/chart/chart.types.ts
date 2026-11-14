/**
 * Type CwChartType
 *
 * @description
 * Form of a chart: vertical or horizontal bars, lines, lines with their area, or a ring.
 *
 * @type {'bar' | 'line' | 'area' | 'donut'}
 */
export type CwChartType = 'bar' | 'line' | 'area' | 'donut';

/**
 * Type CwChartColor
 *
 * @description
 * The five data colors, in this order; no other color is allowed in a chart.
 *
 * @type {'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5'}
 */
export type CwChartColor = 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5';

/**
 * Type CwChartOrientation
 *
 * @description
 * Direction of the bars: one column per category, or one row per category.
 *
 * @type {'vertical' | 'horizontal'}
 */
export type CwChartOrientation = 'vertical' | 'horizontal';

/**
 * Type CwChartSize
 *
 * @description
 * Height of the plot: 150 px (`default`) or 120 px (`sm`).
 *
 * @type {'sm' | 'default'}
 */
export type CwChartSize = 'sm' | 'default';

/**
 * Interface CwChartSeries
 *
 * @description
 * One series drawn by a chart: `key` reads its value in each entry of `data`, `label` names it in the legend, the tooltip and the data table. `dashed` draws a reference series (ideal, target) as a dashed line, without area or end dot.
 */
export interface CwChartSeries {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Key used to read this series from each datum.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property label
   *
   * @description
   * Display name used in the legend and tooltip.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property color
   *
   * @description
   * Chart color assigned to this series.
   *
   * @type {CwChartColor}
   * @readonly
   */
  readonly color: CwChartColor;

  /**
   * Property dashed
   *
   * @description
   * Whether to draw this series as a dashed reference line.
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly dashed?: boolean;
  // #endregion
}

/**
 * Type CwChartDatum
 *
 * @description
 * One entry of `data`: the category under the `x` key (« S45 »), and one value per series key. A missing or non-numeric value is a gap: no bar, a break in the line.
 *
 * @type {Readonly<Record<string, number | string | null | undefined>>}
 */
export type CwChartDatum = Readonly<Record<string, number | string | null | undefined>>;

/**
 * Type CwChartValueFormat
 *
 * @description
 * Formats a value for the axis, the tooltip, the legend and the data table.
 *
 * @type {(value: number) => string}
 */
export type CwChartValueFormat = (value: number) => string;

/**
 * Type CwChartCategoryFormat
 *
 * @description
 * Formats a category for the tooltip title and the announcement (« S45 » → « Semaine 45 »).
 *
 * @type {(category: string) => string}
 */
export type CwChartCategoryFormat = (category: string) => string;

/**
 * Interface CwChartCategorySelect
 *
 * @description
 * Emitted when a category is clicked or chosen with Enter: its key and the values of its series.
 */
export interface CwChartCategorySelect {
  // #region Properties
  /**
   * Property x
   *
   * @description
   * Selected category key.
   *
   * @type {string}
   * @readonly
   */
  readonly x: string;

  /**
   * Property values
   *
   * @description
   * Numeric values of the selected category by series key.
   *
   * @type {Readonly<Record<string, number>>}
   * @readonly
   */
  readonly values: Readonly<Record<string, number>>;
  // #endregion
}
