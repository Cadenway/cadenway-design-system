import type { CwStatTrendLabels } from './stat.types';

/**
 * The French words read before a change by screen readers, since the arrow is decorative (Stat
 * sheet of the Design System artifact, "Accessibilité": « en hausse : +7 »). Override them through
 * the `trendLabels` input of `cw-stat`.
 */
export const CW_STAT_TREND_LABELS: CwStatTrendLabels = {
  up: 'en hausse',
  down: 'en baisse',
  flat: 'stable',
};
