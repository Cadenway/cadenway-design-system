import { Component, computed, input } from '@angular/core';

import type { CwStatSparklineType } from '../stat.types';

const WIDTH = 80;
const HEIGHT = 28;
const BAR_WIDTH = 7;
// The line keeps 3 px above its highest point and 2 px under its lowest, so the end dot (2.25 px)
// and the round caps stay inside the 28 px box.
const LINE_TOP = 3;
const LINE_BOTTOM = HEIGHT - 2;

interface SparkBar {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly last: boolean;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
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
  /** The values, oldest first. */
  readonly data = input<readonly number[]>([]);
  /** Line with its area, or bars. */
  readonly type = input<CwStatSparklineType>('line');

  private readonly values = computed(() => this.data().filter((value) => Number.isFinite(value)));

  protected readonly points = computed(() => {
    const values = this.values();
    if (values.length === 0) return [];
    const min = Math.min(...values);
    const span = Math.max(...values) - min || 1;
    const step = values.length > 1 ? WIDTH / (values.length - 1) : 0;
    return values.map((value, index) => ({
      x: round(values.length > 1 ? index * step : WIDTH / 2),
      y: round(LINE_BOTTOM - ((value - min) / span) * (LINE_BOTTOM - LINE_TOP)),
    }));
  });

  protected readonly polyline = computed(() =>
    this.points()
      .map((point) => `${String(point.x)},${String(point.y)}`)
      .join(' '),
  );

  protected readonly area = computed(() => {
    const points = this.points();
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${String(first.x)},${String(HEIGHT)} ${this.polyline()} ${String(last.x)},${String(HEIGHT)}`;
  });

  protected readonly end = computed(() => this.points().at(-1) ?? null);

  protected readonly bars = computed<readonly SparkBar[]>(() => {
    const values = this.values();
    const max = Math.max(0, ...values) || 1;
    const step = values.length > 1 ? (WIDTH - BAR_WIDTH) / (values.length - 1) : 0;
    return values.map((value, index) => {
      const height = round((Math.max(value, 0) / max) * HEIGHT);
      return {
        x: round(index * step),
        y: round(HEIGHT - height),
        height,
        last: index === values.length - 1,
      };
    });
  });
}
