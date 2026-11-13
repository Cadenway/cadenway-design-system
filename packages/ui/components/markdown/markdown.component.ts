import { Component, computed, input } from '@angular/core';

import { CwMarkdownBlocks } from './markdown-blocks/markdown-blocks.component';
import { ɵcreateMarked } from './markdown.marked';
import { MARKDOWN_CONTEXT, type MarkdownContext } from './markdown.token';
import { toBlocks } from './markdown.tree';

/**
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
  /** The Markdown to show. */
  readonly source = input('');
  /** Word read before a mention by assistive technologies (« mention Karim Benali »). */
  readonly mentionLabel = input('mention');

  private readonly marked = ɵcreateMarked();

  protected readonly blocks = computed(() => toBlocks(this.marked.lexer(this.source())));
}
