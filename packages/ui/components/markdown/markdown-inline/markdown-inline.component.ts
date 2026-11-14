import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, input, type InputSignal } from '@angular/core';

import { MARKDOWN_CONTEXT, type MarkdownContext } from '../markdown.token';
import type { MarkdownInline } from '../markdown.tree';

/**
 * Component CwMarkdownInline
 *
 * @description
 * The inline pieces of one block of a `cw-markdown`: text, bold, italic, underline, strike, inline
 * code, links and mentions, nested as the Markdown nests them. Internal to the entry point.
 *
 * Classes from the mockup (App.dc.html, `RUN_CLS`) and the CommentComposer sheet (mention). Text is
 * only ever interpolated; a link carries an address already checked by `safeHref`, opens in a new
 * tab (mockup) and is still sanitized by Angular.
 */
@Component({
  selector: 'cw-markdown-inline',
  imports: [NgTemplateOutlet],
  host: { class: 'contents' },
  templateUrl: './markdown-inline.component.html',
})
export class CwMarkdownInline {
  // #region Properties
  /**
   * Property nodes
   * @readonly
   *
   * @description
   * Inline pieces to render in order.
   *
   * @type {InputSignal<readonly MarkdownInline[]>}
   */
  public readonly nodes: InputSignal<readonly MarkdownInline[]> =
    input.required<readonly MarkdownInline[]>();

  /**
   * Property context
   * @readonly
   *
   * @description
   * Parent Markdown rendering context.
   *
   * @type {MarkdownContext}
   */
  protected readonly context: MarkdownContext = inject(MARKDOWN_CONTEXT);
  // #endregion

  // #region Methods
  /**
   * Method asNodes
   *
   * @description
   * Types the context of the recursive template.
   *
   * @param {unknown} list - Untyped recursive template context.
   *
   * @returns {readonly MarkdownInline[]} Context interpreted as a list of inline Markdown pieces.
   */
  protected asNodes(list: unknown): readonly MarkdownInline[] {
    return list as readonly MarkdownInline[];
  }
  // #endregion
}
