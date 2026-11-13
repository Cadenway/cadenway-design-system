/*
 * Public API of @cadenway/ui/filter-bar (Filter Bar sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwFilterBar } from './filter-bar.component';
export { CW_FILTER_BAR_LABELS } from './filter-bar.constants';
export type {
  CwFilter,
  CwFilterBarLabels,
  CwFilterField,
  CwFilterFieldType,
  CwFilterOperator,
  CwFilterOption,
  CwFilterOptionContext,
  CwFilterValue,
  CwFilterValueContext,
  CwSavedFilter,
} from './filter-bar.types';
export { CwFilterChip } from './filter-chip/filter-chip.component';
export { CwFilterOptionDef } from './filter-option/filter-option.directive';
export { CwFilterValueDef } from './filter-value/filter-value.directive';
