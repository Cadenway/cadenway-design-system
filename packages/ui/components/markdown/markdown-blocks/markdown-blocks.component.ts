import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { CwCodeBlock } from '@cadenway/ui/components/code-block';

import { CwMarkdownInline } from '../markdown-inline/markdown-inline.component';
import type { MarkdownBlock } from '../markdown.tree';

/* Text alignment of a table cell (GFM `:---:`), literal classes. */
const ALIGN = { start: 'text-left', center: 'text-center', end: 'text-right' } as const;

/**
 * The blocks of a `cw-markdown`, or of one of its quotes or list items: headings, paragraphs,
 * lists (bullet, numbered, tasks), quotes, code blocks (`cw-code-block`), separators and tables.
 * Internal to the entry point.
 *
 * Classes from the mockup (App.dc.html, `BLOCK_CLS` and the read view of a document). The host is
 * `display: contents`: the container decides the spacing between blocks.
 */
@Component({
  selector: 'cw-markdown-blocks',
  imports: [CwCodeBlock, CwMarkdownInline, NgTemplateOutlet],
  host: { class: 'contents' },
  templateUrl: './markdown-blocks.component.html',
})
export class CwMarkdownBlocks {
  /** The blocks to render, in order. */
  readonly blocks = input.required<readonly MarkdownBlock[]>();

  protected readonly align = ALIGN;

  /** Types the untyped context of the recursive template. */
  protected asBlocks(list: unknown): readonly MarkdownBlock[] {
    return list as readonly MarkdownBlock[];
  }
}
