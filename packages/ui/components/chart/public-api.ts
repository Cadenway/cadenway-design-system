/*
 * Public API of @cadenway/ui/chart (Chart sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwChart } from './chart.component';
export type {
  CwChartCategoryFormat,
  CwChartCategorySelect,
  CwChartColor,
  CwChartDatum,
  CwChartOrientation,
  CwChartSeries,
  CwChartSize,
  CwChartType,
  CwChartValueFormat,
} from './chart.types';

export { CW_CHART_LABELS } from './chart.constants';
export { provideCwChartLabels } from './chart.providers';
export type { CwChartLabels } from './chart.types';
