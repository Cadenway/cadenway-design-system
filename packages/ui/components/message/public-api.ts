/*
 * Public API of @cadenway/ui/message (Message sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwMessage } from './message.component';
export { CwMessageActions } from './message-actions/message-actions.component';
export { CwMessageAvatar } from './message-avatar/message-avatar.component';
export { CwMessageFooter } from './message-footer/message-footer.component';
export { CwMessageGroup } from './message-group/message-group.component';
export { CwMessageNote } from './message-note/message-note.component';
export { CwMessageThread } from './message-thread/message-thread.component';
export type {
  CwMessageLabels,
  CwMessageStatus,
  CwMessageThreadLabels,
  CwMessageTimeFormatter,
  CwMessageTone,
  CwMessageToneLabels,
  CwMessageVariant,
} from './message.types';
