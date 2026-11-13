/*
 * Public API of @cadenway/ui/stat (Stat sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwStat } from './stat.component';
export { CW_STAT_TREND_LABELS } from './stat.constants';
export { CwStatGroup } from './stat-group/stat-group.component';
export { CwStatSparkline } from './stat-sparkline/stat-sparkline.component';
export type {
  CwStatDeltaVariant,
  CwStatGoal,
  CwStatSentiment,
  CwStatSize,
  CwStatSparklineType,
  CwStatTrend,
  CwStatTrendLabels,
} from './stat.types';
