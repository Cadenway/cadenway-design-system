/*
 * Public API of @cadenway/ui/relations (Relations sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwRelationLeading } from './relation-leading/relation-leading.directive';
export { CwRelationPicker } from './relation-picker/relation-picker.component';
export { CwRelations } from './relations.component';
export { CW_RELATIONS_LABELS } from './relations.constants';
export type {
  CwRelation,
  CwRelationAddEvent,
  CwRelationChangeTypeEvent,
  CwRelationItem,
  CwRelationLeadingContext,
  CwRelationPerson,
  CwRelationType,
  CwRelationsLabels,
} from './relations.types';
