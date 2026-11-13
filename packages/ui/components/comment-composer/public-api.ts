/*
 * Public API of @cadenway/ui/comment-composer (CommentComposer sheet of the Design System
 * artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwCommentComposer } from './comment-composer.component';
export { CW_COMMENT_COMPOSER_LABELS, CW_COMPOSER_COMMANDS } from './comment-composer.constants';
export type {
  CwAttachmentDraft,
  CwCommentComposerLabels,
  CwCommentComposerMode,
  CwCommentComposerVariant,
  CwCommentSubmit,
  CwComposerCommand,
  CwPerson,
} from './comment-composer.types';
