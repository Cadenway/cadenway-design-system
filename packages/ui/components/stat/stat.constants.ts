import type { CwStatLabels, CwStatTrendLabels } from './stat.types';

/**
 * Constant CW_STAT_TREND_LABELS
 *
 * @description
 * The French words read before a change by screen readers, since the arrow is decorative (Stat
 * sheet of the Design System artifact, "Accessibilité": « en hausse : +7 »). Override them through
 * the `trendLabels` input of `cw-stat`.
 *
 * @type {CwStatTrendLabels}
 */
export const CW_STAT_TREND_LABELS: CwStatTrendLabels = {
  up: 'en hausse',
  down: 'en baisse',
  flat: 'stable',
};

/**
 * Constant CW_STAT_LABELS
 *
 * @description
 * Default statistic texts from the Stat sheet of the Design System artifact.
 *
 * @type {CwStatLabels}
 */
export const CW_STAT_LABELS: CwStatLabels = {
  ...CW_STAT_TREND_LABELS,
  refreshing: 'Actualisation',
  goalOf: 'sur',
};
