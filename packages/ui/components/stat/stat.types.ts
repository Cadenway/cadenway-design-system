/** Direction of a change, drawn as an arrow: `up` (trend up), `down` (trend down), `flat` (arrow right). */
export type CwStatTrend = 'up' | 'down' | 'flat';

/**
 * What the change means for the team, which sets its color: `positive` in jade, `negative` in
 * grenat, `neutral` muted. The color follows the meaning, never the sign: more late tasks is an
 * `up` trend with a `negative` sentiment.
 */
export type CwStatSentiment = 'positive' | 'negative' | 'neutral';

/** Size of a stat: `default` on a dashboard (value 20 px), `sm` in a side panel (value 16 px). */
export type CwStatSize = 'default' | 'sm';

/** How the change is written: plain text after the arrow, or a tinted pill (period comparison). */
export type CwStatDeltaVariant = 'inline' | 'pill';

/**
 * A goal the value moves toward, drawn as a jade track under the value (« 34 sur 50 · 68 % »).
 * `unit` is appended to the maximum (« 34 sur 50 engagés »).
 */
export interface CwStatGoal {
  readonly value: number;
  readonly max: number;
  readonly unit?: string;
}

/** Form of a sparkline: a line with its area, or bars with the last one stressed. */
export type CwStatSparklineType = 'line' | 'bar';

/** The words read before the change by screen readers (« en hausse : +7 »), one per trend. */
export type CwStatTrendLabels = Readonly<Record<CwStatTrend, string>>;
