import { NgTemplateOutlet } from '@angular/common';
import { Component, input, type InputSignal } from '@angular/core';
import { CwCodeBlock } from '@cadenway/ui/components/code-block';

import { CwMarkdownInline } from '../markdown-inline/markdown-inline.component';
import type { MarkdownBlock } from '../markdown.tree';

/* Text alignment of a table cell (GFM `:---:`), literal classes. */
/**
 * Constant ALIGN
 *
 * @description
 * Alignment classes for Markdown table cells.
 *
 * @type {typeof ALIGN}
 */
const ALIGN: {
  readonly start: 'text-left';
  readonly center: 'text-center';
  readonly end: 'text-right';
} = { start: 'text-left', center: 'text-center', end: 'text-right' } as const;

/**
 * Component CwMarkdownBlocks
 *
 * @description
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
  // #region Properties
  /**
   * Property blocks
   * @readonly
   *
   * @description
   * Blocks to render in order.
   *
   * @type {InputSignal<readonly MarkdownBlock[]>}
   */
  public readonly blocks: InputSignal<readonly MarkdownBlock[]> =
    input.required<readonly MarkdownBlock[]>();

  /**
   * Property align
   * @readonly
   *
   * @description
   * Alignment classes for table cells.
   *
   * @type {typeof ALIGN}
   */
  protected readonly align: {
    readonly start: 'text-left';
    readonly center: 'text-center';
    readonly end: 'text-right';
  } = ALIGN;
  // #endregion

  // #region Methods
  /**
   * Method asBlocks
   *
   * @description
   * Types the context of the recursive template.
   *
   * @param {unknown} list - Untyped recursive template context.
   *
   * @returns {readonly MarkdownBlock[]} Context interpreted as a list of Markdown blocks.
   */
  protected asBlocks(list: unknown): readonly MarkdownBlock[] {
    return list as readonly MarkdownBlock[];
  }
  // #endregion
}
