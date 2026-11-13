/*
 * Public API of @cadenway/ui/block-editor (rich text editing of the mockup, App.dc.html document
 * editor and task description). The only entry point that loads the editor engine (Tiptap).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwBlockEditor } from './block-editor.component';
export {
  CW_BLOCK_EDITOR_LABELS,
  CW_BLOCK_TYPES,
  CW_INLINE_MARKS,
  CW_TOOLBAR_BLOCKS,
} from './block-editor.constants';
export type {
  CwBlockEditorLabels,
  CwBlockEditorVariant,
  CwBlockKind,
  CwBlockType,
  CwInlineMark,
  CwInlineMarkButton,
  CwMentionPerson,
  CwMentionSearch,
} from './block-editor.types';
