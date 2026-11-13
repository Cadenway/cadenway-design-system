/*
 * Pure geometry of `cw-chart`: scales and SVG paths, kept apart from the component so the drawing
 * rules of the Chart sheet (Design System artifact, "Anatomie") read in one place. Internal: not
 * exported by the entry point.
 */

/** Rounds a coordinate to two decimals, so the SVG attributes stay short and stable. */
export function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** A value scale that starts at zero (bars always start at zero, sheet "Règles"). */
export interface ValueScale {
  readonly max: number;
  readonly ticks: readonly number[];
}

/**
 * A zero-based scale over `max` with `intervals` steps of a round size (1, 2, 2.5 or 5 times a power
 * of ten), so the grid lines fall on readable values.
 */
export function niceScale(max: number, intervals: number): ValueScale {
  if (!(max > 0))
    return { max: intervals, ticks: Array.from({ length: intervals + 1 }, (_, i) => i) };
  const raw = max / intervals;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step =
    [1, 2, 2.5, 5, 10].map((factor) => factor * power).find((candidate) => candidate >= raw) ??
    10 * power;
  // Counts are integers: a step under 1 would write the same label twice.
  const integerStep = max >= intervals && step < 1 ? 1 : step;
  const top = integerStep * Math.ceil(max / integerStep);
  const count = Math.round(top / integerStep);
  return { max: top, ticks: Array.from({ length: count + 1 }, (_, i) => round(i * integerStep)) };
}

/** Which corners of a rectangle are rounded. */
export interface Corners {
  readonly topLeft?: boolean;
  readonly topRight?: boolean;
  readonly bottomRight?: boolean;
  readonly bottomLeft?: boolean;
}

/**
 * The path of a rectangle with some corners rounded: a stacked bar rounds only its outer end
 * (sheet: « empilées : seul le segment du haut est arrondi »).
 */
export function roundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  corners: Corners,
): string {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  const tl = corners.topLeft ? r : 0;
  const tr = corners.topRight ? r : 0;
  const br = corners.bottomRight ? r : 0;
  const bl = corners.bottomLeft ? r : 0;
  const right = x + width;
  const bottom = y + height;
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

/** A point of a line series; `null` values break the line. */
export interface LinePoint {
  readonly x: number;
  readonly y: number;
}

/** Splits a series into its unbroken runs, so a missing value leaves a gap instead of a fake slope. */
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

/** The `points` attribute of a polyline. */
export function polyline(run: readonly LinePoint[]): string {
  return run.map((point) => `${String(point.x)},${String(point.y)}`).join(' ');
}

/** The closed path of the area under a run, down to the baseline. */
export function areaPath(run: readonly LinePoint[], baseline: number): string {
  if (run.length === 0) return '';
  const first = run[0];
  const last = run[run.length - 1];
  const line = run.map((point) => `L${String(point.x)},${String(point.y)}`).join(' ');
  return `M${String(first.x)},${String(baseline)} ${line} L${String(last.x)},${String(baseline)} Z`;
}

/** Rough width of a 10 px label, to size the gutters without measuring text in the DOM. */
export function labelWidth(text: string): number {
  return text.length * 5.5;
}
