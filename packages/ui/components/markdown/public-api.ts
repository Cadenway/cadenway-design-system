/*
 * Public API of @cadenway/ui/components/markdown (rich text of the mockup, App.dc.html "Texte riche").
 *
 * Explicit named exports only (.claude/rules/public-api.md). The four `ɵ` re-exports preserve
 * compatibility with the former location of the shared grammar.
 */

export { CwMarkdown } from './markdown.component';
export { ɵcreateMarked } from './markdown.marked';
export { ɵwriteMention } from '@cadenway/ui/core';
export type { ɵMentionToken, ɵUnderlineToken } from '@cadenway/ui/core';
