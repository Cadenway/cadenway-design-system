/*
 * Public API of @cadenway/ui/components/heat-grid: the load grid, rows by columns, of the workload
 * view (mockup `App.dc.html`).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwHeatGrid } from './heat-grid.component';
export { CwHeatGridChipDef } from './heat-grid-chip/heat-grid-chip.directive';
export { CwHeatGridTotalDef } from './heat-grid-total/heat-grid-total.directive';
export { CW_HEAT_GRID_HIGH, CW_HEAT_GRID_LABELS } from './heat-grid.constants';
export { provideCwHeatGridLabels } from './heat-grid.providers';
export type {
  CwHeatGridCell,
  CwHeatGridCellEvent,
  CwHeatGridCellLabelContext,
  CwHeatGridColumn,
  CwHeatGridItemContext,
  CwHeatGridLabels,
  CwHeatGridLevel,
  CwHeatGridRow,
  CwHeatGridTotalContext,
} from './heat-grid.types';
