import { Component, computed, input, type InputSignal, type Signal } from '@angular/core';

import type { CwStatSparklineType } from '../stat.types';

/**
 * Constant WIDTH
 *
 * @description
 * Width of the sparkline drawing area in pixels.
 *
 * @type {number}
 */
const WIDTH: number = 80;

/**
 * Constant HEIGHT
 *
 * @description
 * Height of the sparkline drawing area in pixels.
 *
 * @type {number}
 */
const HEIGHT: number = 28;

/**
 * Constant BAR_WIDTH
 *
 * @description
 * Width of each bar in pixels.
 *
 * @type {number}
 */
const BAR_WIDTH: number = 7;
// The line keeps 3 px above its highest point and 2 px under its lowest, so the end dot (2.25 px)
// and the round caps stay inside the 28 px box.
/**
 * Constant LINE_TOP
 *
 * @description
 * Upper line boundary, leaving room for the end dot and caps.
 *
 * @type {number}
 */
const LINE_TOP: number = 3;

/**
 * Constant LINE_BOTTOM
 *
 * @description
 * Lower line boundary, leaving room for the end dot and caps.
 *
 * @type {number}
 */
const LINE_BOTTOM: number = HEIGHT - 2;

/**
 * Interface SparkBar
 *
 * @description
 * Geometry and emphasis state of a sparkline bar.
 */
interface SparkBar {
  // #region Properties
  /**
   * Property x
   * @readonly
   *
   * @description
   * Horizontal position in the drawing area.
   *
   * @type {number}
   */
  readonly x: number;

  /**
   * Property y
   * @readonly
   *
   * @description
   * Vertical position of the bar top.
   *
   * @type {number}
   */
  readonly y: number;

  /**
   * Property height
   * @readonly
   *
   * @description
   * Bar height in pixels.
   *
   * @type {number}
   */
  readonly height: number;

  /**
   * Property last
   * @readonly
   *
   * @description
   * Whether this is the final, emphasized bar.
   *
   * @type {boolean}
   */
  readonly last: boolean;
  // #endregion
}

/**
 * Function round
 *
 * @description
 * Rounds a drawing coordinate to one decimal place.
 *
 * @param {number} value - Drawing coordinate to round.
 *
 * @returns {number} Coordinate rounded to one decimal place.
 */
function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Class CwStatSparkline
 * @class CwStatSparkline
 *
 * @description
 * The 80 × 28 px mini chart of a stat, drawn right of its value: a `line` in `chart-1` with its
 * area and an end dot (a 7-day trend), or `bar` in `chart-2` with the last bar stressed (volume
 * per day). Stat sheet of the Design System artifact, "Mini-graphique".
 *
 * Project it into `cw-stat`. Decorative (`aria-hidden`): the value and the change carry the
 * information, so never put a fact only in the sparkline. Values must be finite numbers; the line
 * spans the range of `data`, bars start at zero. No axis, no tooltip, no animation.
 */
@Component({
  selector: 'cw-stat-sparkline',
  host: {
    class: 'block h-7 w-20 shrink-0',
    'aria-hidden': 'true',
    '[attr.data-type]': 'type()',
  },
  templateUrl: './stat-sparkline.component.html',
})
export class CwStatSparkline {
  // #region Properties
  /**
   * Property data
   * @readonly
   *
   * @description
   * Values in chronological order, oldest first.
   *
   * @type {InputSignal<readonly number[]>}
   */
  public readonly data: InputSignal<readonly number[]> = input<readonly number[]>([]);

  /**
   * Property type
   * @readonly
   *
   * @description
   * Display as an area line or bars.
   *
   * @type {InputSignal<CwStatSparklineType>}
   */
  public readonly type: InputSignal<CwStatSparklineType> = input<CwStatSparklineType>('line');

  /**
   * Property values
   * @readonly
   *
   * @description
   * Finite values accepted for drawing.
   *
   * @type {Signal<number[]>}
   */
  private readonly values: Signal<number[]> = computed(() =>
    this.data().filter((value) => Number.isFinite(value)),
  );

  /**
   * Property points
   * @readonly
   *
   * @description
   * Coordinates of the normalized line values.
   *
   * @type {Signal<{ x: number; y: number }[]>}
   */
  protected readonly points: Signal<{ x: number; y: number }[]> = computed(() => {
    const values: number[] = this.values();
    if (values.length === 0) return [];
    const min: number = Math.min(...values);
    const span: number = Math.max(...values) - min || 1;
    const step: number = values.length > 1 ? WIDTH / (values.length - 1) : 0;
    return values.map((value, index) => ({
      x: round(values.length > 1 ? index * step : WIDTH / 2),
      y: round(LINE_BOTTOM - ((value - min) / span) * (LINE_BOTTOM - LINE_TOP)),
    }));
  });

  /**
   * Property polyline
   * @readonly
   *
   * @description
   * SVG point list for the line.
   *
   * @type {Signal<string>}
   */
  protected readonly polyline: Signal<string> = computed(() =>
    this.points()
      .map((point) => `${String(point.x)},${String(point.y)}`)
      .join(' '),
  );

  /**
   * Property area
   * @readonly
   *
   * @description
   * SVG polygon point list filling the area beneath the line.
   *
   * @type {Signal<string>}
   */
  protected readonly area: Signal<string> = computed(() => {
    const points: { x: number; y: number }[] = this.points();
    if (points.length === 0) return '';
    const first: { x: number; y: number } = points[0];
    const last: { x: number; y: number } = points[points.length - 1];
    return `${String(first.x)},${String(HEIGHT)} ${this.polyline()} ${String(last.x)},${String(HEIGHT)}`;
  });

  /**
   * Property end
   * @readonly
   *
   * @description
   * Final line point, or null when there are no values.
   *
   * @type {Signal<{ x: number; y: number } | null>}
   */
  protected readonly end: Signal<{ x: number; y: number } | null> = computed(
    () => this.points().at(-1) ?? null,
  );

  /**
   * Property bars
   * @readonly
   *
   * @description
   * Bar coordinates scaled to the largest nonnegative value.
   *
   * @type {Signal<readonly SparkBar[]>}
   */
  protected readonly bars: Signal<readonly SparkBar[]> = computed<readonly SparkBar[]>(() => {
    const values: number[] = this.values();
    const max: number = Math.max(0, ...values) || 1;
    const step: number = values.length > 1 ? (WIDTH - BAR_WIDTH) / (values.length - 1) : 0;
    return values.map((value, index) => {
      const height: number = round((Math.max(value, 0) / max) * HEIGHT);
      return {
        x: round(index * step),
        y: round(HEIGHT - height),
        height,
        last: index === values.length - 1,
      };
    });
  });
  // #endregion
}
