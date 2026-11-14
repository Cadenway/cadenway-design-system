import { InjectionToken, type Signal } from '@angular/core';

/**
 * Interface MarkdownContext
 *
 * @description
 * Context provided to nested Markdown renderers.
 */
export interface MarkdownContext {
  // #region Properties
  /**
   * Property mentionLabel
   * @readonly
   *
   * @description
   * Word read by assistive technologies before a mention.
   *
   * @type {Signal<string>}
   */
  readonly mentionLabel: Signal<string>;
  // #endregion
}

/**
 * Constant MARKDOWN_CONTEXT
 *
 * @description
 * The enclosing `cw-markdown`, for its nested block and inline parts, which import neither it nor
 * each other's parent. Not exported from the entry point.
 *
 * @type {InjectionToken<MarkdownContext>}
 */
export const MARKDOWN_CONTEXT: InjectionToken<MarkdownContext> =
  new InjectionToken<MarkdownContext>('MARKDOWN_CONTEXT');
