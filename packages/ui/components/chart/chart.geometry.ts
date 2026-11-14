/*
 * Pure geometry of `cw-chart`: scales and SVG paths, kept apart from the component so the drawing
 * rules of the Chart sheet (Design System artifact, "Anatomie") read in one place. Internal: not
 * exported by the entry point.
 */

/**
 * Function round
 *
 * @description
 * Rounds a coordinate to two decimals, so the SVG attributes stay short and stable.
 *
 * @param {number} value - Value to format or constrain.
 * @returns {number} Coordinate rounded to two decimals.
 */
export function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Interface ValueScale
 *
 * @description
 * A value scale that starts at zero (bars always start at zero, sheet "Règles").
 */
export interface ValueScale {
  // #region Properties
  /**
   * Property max
   *
   * @description
   * Maximum value on the scale.
   *
   * @type {number}
   * @readonly
   */
  readonly max: number;

  /**
   * Property ticks
   *
   * @description
   * Tick values on the scale.
   *
   * @type {readonly number[]}
   * @readonly
   */
  readonly ticks: readonly number[];
  // #endregion
}

/**
 * Function niceScale
 *
 * @description
 * A zero-based scale over `max` with `intervals` steps of a round size (1, 2, 2.5 or 5 times a power of ten), so the grid lines fall on readable values.
 *
 * @param {number} max - Upper bound or maximum data value.
 * @param {number} intervals - Number of scale intervals.
 * @returns {ValueScale} Zero-based scale and tick values.
 */
export function niceScale(max: number, intervals: number): ValueScale {
  if (!(max > 0))
    return { max: intervals, ticks: Array.from({ length: intervals + 1 }, (_, i) => i) };
  const raw: number = max / intervals;
  const power: number = 10 ** Math.floor(Math.log10(raw));
  const step: number =
    [1, 2, 2.5, 5, 10].map((factor) => factor * power).find((candidate) => candidate >= raw) ??
    10 * power;
  // Counts are integers: a step under 1 would write the same label twice.
  const integerStep: number = max >= intervals && step < 1 ? 1 : step;
  const top: number = integerStep * Math.ceil(max / integerStep);
  const count: number = Math.round(top / integerStep);
  return { max: top, ticks: Array.from({ length: count + 1 }, (_, i) => round(i * integerStep)) };
}

/**
 * Interface Corners
 *
 * @description
 * Which corners of a rectangle are rounded.
 */
export interface Corners {
  // #region Properties
  /**
   * Property topLeft
   *
   * @description
   * Whether to round the top-left corner.
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly topLeft?: boolean;

  /**
   * Property topRight
   *
   * @description
   * Whether to round the top-right corner.
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly topRight?: boolean;

  /**
   * Property bottomRight
   *
   * @description
   * Whether to round the bottom-right corner.
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly bottomRight?: boolean;

  /**
   * Property bottomLeft
   *
   * @description
   * Whether to round the bottom-left corner.
   *
   * @type {boolean | undefined}
   * @readonly
   */
  readonly bottomLeft?: boolean;
  // #endregion
}

/**
 * Function roundedRect
 *
 * @description
 * The path of a rectangle with some corners rounded: a stacked bar rounds only its outer end (sheet: « empilées : seul le segment du haut est arrondi »).
 *
 * @param {number} x - Horizontal position.
 * @param {number} y - Vertical position.
 * @param {number} width - Rectangle width.
 * @param {number} height - Rectangle height.
 * @param {number} radius - Corner radius.
 * @param {Corners} corners - Corners to round.
 * @returns {string} SVG path for the rounded rectangle.
 */
export function roundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  corners: Corners,
): string {
  const r: number = Math.max(0, Math.min(radius, width / 2, height / 2));
  const tl: number = corners.topLeft ? r : 0;
  const tr: number = corners.topRight ? r : 0;
  const br: number = corners.bottomRight ? r : 0;
  const bl: number = corners.bottomLeft ? r : 0;
  const right: number = x + width;
  const bottom: number = y + height;
  return [
    `M${String(round(x + tl))},${String(round(y))}`,
    `H${String(round(right - tr))}`,
    tr
      ? `Q${String(round(right))},${String(round(y))} ${String(round(right))},${String(round(y + tr))}`
      : '',
    `V${String(round(bottom - br))}`,
    br
      ? `Q${String(round(right))},${String(round(bottom))} ${String(round(right - br))},${String(round(bottom))}`
      : '',
    `H${String(round(x + bl))}`,
    bl
      ? `Q${String(round(x))},${String(round(bottom))} ${String(round(x))},${String(round(bottom - bl))}`
      : '',
    `V${String(round(y + tl))}`,
    tl
      ? `Q${String(round(x))},${String(round(y))} ${String(round(x + tl))},${String(round(y))}`
      : '',
    'Z',
  ].join('');
}

/**
 * Interface LinePoint
 *
 * @description
 * A point of a line series; `null` values break the line.
 */
export interface LinePoint {
  // #region Properties
  /**
   * Property x
   *
   * @description
   * Horizontal coordinate.
   *
   * @type {number}
   * @readonly
   */
  readonly x: number;

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
  // #endregion
}

/**
 * Function segments
 *
 * @description
 * Splits a series into its unbroken runs, so a missing value leaves a gap instead of a fake slope.
 *
 * @param {readonly (LinePoint | null)[]} points - Points to split at gaps.
 * @returns {LinePoint[][]} Uninterrupted runs of points.
 */
export function segments(points: readonly (LinePoint | null)[]): LinePoint[][] {
  const runs: LinePoint[][] = [];
  let current: LinePoint[] = [];
  for (const point of points) {
    if (point) {
      current.push(point);
    } else if (current.length) {
      runs.push(current);
      current = [];
    }
  }
  if (current.length) runs.push(current);
  return runs;
}

/**
 * Function polyline
 *
 * @description
 * The `points` attribute of a polyline.
 *
 * @param {readonly LinePoint[]} run - Uninterrupted sequence of points.
 * @returns {string} SVG polyline points string.
 */
export function polyline(run: readonly LinePoint[]): string {
  return run.map((point) => `${String(point.x)},${String(point.y)}`).join(' ');
}

/**
 * Function areaPath
 *
 * @description
 * The closed path of the area under a run, down to the baseline.
 *
 * @param {readonly LinePoint[]} run - Uninterrupted sequence of points.
 * @param {number} baseline - Vertical baseline of the area.
 * @returns {string} Closed SVG area path.
 */
export function areaPath(run: readonly LinePoint[], baseline: number): string {
  if (run.length === 0) return '';
  const first: LinePoint = run[0];
  const last: LinePoint = run[run.length - 1];
  const line: string = run.map((point) => `L${String(point.x)},${String(point.y)}`).join(' ');
  return `M${String(first.x)},${String(baseline)} ${line} L${String(last.x)},${String(baseline)} Z`;
}

/**
 * Function labelWidth
 *
 * @description
 * Rough width of a 10 px label, to size the gutters without measuring text in the DOM.
 *
 * @param {string} text - Text to measure approximately.
 * @returns {number} Estimated width in pixels.
 */
export function labelWidth(text: string): number {
  return text.length * 5.5;
}
