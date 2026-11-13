/*
 * Public API of @cadenway/ui/field (Field sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwField } from './field.component';
export { CwFieldContent } from './field-content/field-content.component';
export { CwFieldDescription } from './field-description/field-description.component';
export { CwFieldError } from './field-error/field-error.component';
export { CwFieldGroup } from './field-group/field-group.component';
export { CwFieldLabel } from './field-label/field-label.directive';
export { CwFieldLegend } from './field-legend/field-legend.directive';
export { CwFieldSeparator } from './field-separator/field-separator.component';
export { CwFieldSet } from './field-set/field-set.directive';
export { CwFieldTitle } from './field-title/field-title.component';
export type {
  CwFieldErrorItem,
  CwFieldErrors,
  CwFieldLabelVariant,
  CwFieldOrientation,
} from './field.types';
