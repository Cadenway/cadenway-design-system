import type { Marked } from 'marked';
import { Component, computed, input, type InputSignal, type Signal } from '@angular/core';

import { CwMarkdownBlocks } from './markdown-blocks/markdown-blocks.component';
import { ɵcreateMarked } from './markdown.marked';
import { MARKDOWN_CONTEXT, type MarkdownContext } from './markdown.token';
import { toBlocks, type MarkdownBlock } from './markdown.tree';

/**
 * Component CwMarkdown
 *
 * @description
 * Shows stored Markdown as formatted text: a comment, a task description, a document in reading
 * mode (mockup App.dc.html, "Texte riche").
 *
 * Reads the Cadenway grammar (the one `cw-block-editor` writes): headings, paragraphs and line
 * breaks, `**bold**`, `*italic*`, `__underline__`, `~~strike~~`, `` `code` ``, links, bullet,
 * numbered and task lists, quotes, code blocks (`cw-code-block`), separators, tables and
 * `@[Karim Benali](id)` mentions. `marked` only tokenizes; Angular templates render the tokens. No
 * HTML from the source reaches the page: markup shows as text, a link keeps only an `http`,
 * `https`, `mailto`, `tel` or relative address and opens in a new tab, an image shows as a link.
 * Task boxes are read-only. The text inherits the color and starts at `text-sm`.
 */
@Component({
  selector: 'cw-markdown',
  imports: [CwMarkdownBlocks],
  providers: [{ provide: MARKDOWN_CONTEXT, useExisting: CwMarkdown }],
  host: { class: 'flex min-w-0 flex-col gap-2 text-sm leading-relaxed break-words' },
  templateUrl: './markdown.component.html',
})
export class CwMarkdown implements MarkdownContext {
  // #region Properties
  /**
   * Property source
   * @readonly
   *
   * @description
   * Markdown source to render.
   *
   * @type {InputSignal<string>}
   */
  public readonly source: InputSignal<string> = input('');

  /**
   * Property mentionLabel
   * @readonly
   *
   * @description
   * Accessible prefix read before a mention.
   *
   * @type {InputSignal<string>}
   */
  public readonly mentionLabel: InputSignal<string> = input('mention');

  /**
   * Property marked
   * @readonly
   *
   * @description
   * Configured Markdown lexer.
   *
   * @type {Marked}
   */
  private readonly marked: Marked = ɵcreateMarked();

  /**
   * Property blocks
   * @readonly
   *
   * @description
   * Parsed blocks rendered by the component.
   *
   * @type {Signal<MarkdownBlock[]>}
   */
  protected readonly blocks: Signal<MarkdownBlock[]> = computed(() =>
    toBlocks(this.marked.lexer(this.source())),
  );
  // #endregion
}
