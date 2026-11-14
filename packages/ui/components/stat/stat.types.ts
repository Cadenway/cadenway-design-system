/**
 * Type CwStatTrend
 *
 * @description
 * Direction of a change, drawn as an up, down or right arrow.
 *
 * @type {'up' | 'down' | 'flat'}
 */
export type CwStatTrend = 'up' | 'down' | 'flat';

/**
 * Type CwStatSentiment
 *
 * @description
 * What the change means for the team, which sets its color: `positive` in jade, `negative` in
 * grenat, `neutral` muted. The color follows the meaning, never the sign: more late tasks is an
 * `up` trend with a `negative` sentiment.
 *
 * @type {'positive' | 'negative' | 'neutral'}
 */
export type CwStatSentiment = 'positive' | 'negative' | 'neutral';

/**
 * Type CwStatSize
 *
 * @description
 * Dashboard or smaller side-panel stat size.
 *
 * @type {'default' | 'sm'}
 */
export type CwStatSize = 'default' | 'sm';

/**
 * Type CwStatDeltaVariant
 *
 * @description
 * Change rendered as inline text or a tinted pill.
 *
 * @type {'inline' | 'pill'}
 */
export type CwStatDeltaVariant = 'inline' | 'pill';

/**
 * Interface CwStatGoal
 *
 * @description
 * A goal the value moves toward, drawn as a jade track under the value (« 34 sur 50 · 68 % »).
 * `unit` is appended to the maximum (« 34 sur 50 engagés »).
 */
export interface CwStatGoal {
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Current progress toward the goal.
   *
   * @type {number}
   */
  readonly value: number;

  /**
   * Property max
   * @readonly
   *
   * @description
   * Target value for the progress track.
   *
   * @type {number}
   */
  readonly max: number;

  /**
   * Property unit
   * @readonly
   *
   * @description
   * Optional unit appended to the target value.
   *
   * @type {string | undefined}
   */
  readonly unit?: string;
  // #endregion
}

/**
 * Type CwStatSparklineType
 *
 * @description
 * Sparkline drawn as an area line or bars.
 *
 * @type {'line' | 'bar'}
 */
export type CwStatSparklineType = 'line' | 'bar';

/**
 * Type CwStatTrendLabels
 *
 * @description
 * Screen-reader text preceding the change for each trend.
 *
 * @type {Readonly<Record<CwStatTrend, string>>}
 */
export type CwStatTrendLabels = Readonly<Record<CwStatTrend, string>>;
