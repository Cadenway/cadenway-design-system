import { InjectionToken, type Signal } from '@angular/core';

/** What the nested parts of a `cw-markdown` read from it. */
export interface MarkdownContext {
  /** Word read before a mention by assistive technologies (« mention Karim Benali »). */
  readonly mentionLabel: Signal<string>;
}

/**
 * The enclosing `cw-markdown`, for its nested block and inline parts, which import neither it nor
 * each other's parent. Not exported from the entry point.
 */
export const MARKDOWN_CONTEXT = new InjectionToken<MarkdownContext>('MARKDOWN_CONTEXT');
