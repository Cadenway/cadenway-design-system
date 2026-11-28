/*
 * Public API of @cadenway/ui/combobox (Combobox sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwCombobox } from './combobox.component';
export { CwComboboxEmpty } from './combobox-empty/combobox-empty.component';
export { CwComboboxGroup } from './combobox-group/combobox-group.component';
export { CwComboboxOption } from './combobox-option/combobox-option.component';
export type {
  CwComboboxCompareWith,
  CwComboboxFilter,
  CwComboboxFilterOption,
  CwComboboxMinWidth,
  CwComboboxSize,
} from './combobox.types';

export { CW_COMBOBOX_LABELS } from './combobox.constants';
export { provideCwComboboxLabels } from './combobox.providers';
export type { CwComboboxLabels } from './combobox.types';
