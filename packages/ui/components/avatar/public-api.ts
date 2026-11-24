/*
 * Public API of @cadenway/ui/avatar (Avatar sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwAvatarAdd } from './avatar-add/avatar-add.component';
export { CwAvatarGroup } from './avatar-group/avatar-group.component';
export { CwAvatar } from './avatar.component';
export type {
  CwAvatarLabels,
  CwAvatarProvidedLabels,
  CwAvatarPresence,
  CwAvatarSize,
} from './avatar.types';

export { CW_AVATAR_LABELS } from './avatar.constants';
export { provideCwAvatarLabels } from './avatar.providers';
