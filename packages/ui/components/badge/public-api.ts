/*
 * Public API of @cadenway/ui/badge (Badge sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CW_BADGE_LABELS } from './badge.constants';
export { provideCwBadgeLabels } from './badge.providers';
export { CwBadge } from './badge.component';
export { CwPriorityBadge } from './priority-badge/priority-badge.component';
export { CwStatusBadge } from './status-badge/status-badge.component';
export type { CwBadgeLabels, CwBadgeSize, CwBadgeVariant } from './badge.types';
