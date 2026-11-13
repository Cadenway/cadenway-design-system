import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, input } from '@angular/core';

import { MARKDOWN_CONTEXT } from '../markdown.token';
import type { MarkdownInline } from '../markdown.tree';

/**
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
  /** The pieces to render, in order. */
  readonly nodes = input.required<readonly MarkdownInline[]>();

  protected readonly context = inject(MARKDOWN_CONTEXT);

  /** Types the untyped context of the recursive template. */
  protected asNodes(list: unknown): readonly MarkdownInline[] {
    return list as readonly MarkdownInline[];
  }
}
