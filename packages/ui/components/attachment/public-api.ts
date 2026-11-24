/*
 * Public API of @cadenway/ui/attachment (Attachment sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwAttachment } from './attachment.component';
export type {
  CwAttachmentLabels,
  CwAttachmentProvidedLabels,
  CwAttachmentOrientation,
  CwAttachmentSize,
  CwAttachmentState,
  CwAttachmentType,
} from './attachment.types';

export { CW_ATTACHMENT_LABELS } from './attachment.constants';
export { provideCwAttachmentLabels } from './attachment.providers';
