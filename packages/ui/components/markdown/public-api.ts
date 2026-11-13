/*
 * Public API of @cadenway/ui/markdown (rich text of the mockup, App.dc.html "Texte riche").
 *
 * Explicit named exports only (.claude/rules/public-api.md). The `ɵ` exports share the Markdown
 * grammar with @cadenway/ui/block-editor; they are not public API.
 */

export { CwMarkdown } from './markdown.component';
export { ɵcreateMarked, ɵwriteMention } from './markdown.marked';
export type { ɵMentionToken, ɵUnderlineToken } from './markdown.marked';
