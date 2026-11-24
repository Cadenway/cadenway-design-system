/*
 * Public API of @cadenway/ui/date-picker (Date Picker sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwDatePicker } from './date-picker.component';
export type {
  CwDatePickerRange,
  CwDatePickerSize,
  CwDatePickerValue,
  CwDatePickerVariant,
  CwDatePreset,
} from './date-picker.types';

export { CW_DATE_PICKER_LABELS } from './date-picker.constants';
export { provideCwDatePickerLabels } from './date-picker.providers';
export type { CwDatePickerLabels } from './date-picker.types';
