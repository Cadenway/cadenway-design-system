/*
 * Public API of @cadenway/ui/property-list (Property List sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwProperty } from './property/property.component';
export { CwPropertyGroup } from './property-group/property-group.component';
export { CwPropertyList } from './property-list.component';
export type { CwPropertyListOrientation } from './property-list.types';
export { CwPropertyValue } from './property-value/property-value.directive';

export { CW_PROPERTY_LIST_LABELS } from './property-list.constants';
export { provideCwPropertyListLabels } from './property-list.providers';
export type { CwPropertyListLabels } from './property-list.types';
