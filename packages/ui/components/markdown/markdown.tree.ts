/*
 * Turns the `marked` token tree into the view model `cw-markdown` renders, one kind per branch of
 * its templates. Internal to the entry point. Nothing here produces HTML: an `html` token becomes
 * text, a link keeps only a safe address.
 */

import type { Token, Tokens } from 'marked';

import type { ɵMentionToken } from './markdown.marked';

/**
 * Type MarkdownInline
 *
 * @description
 * Inline pieces rendered inside a Markdown block.
 *
 * @type {MarkdownInline}
 */
export type MarkdownInline =
  | { readonly kind: 'text'; readonly text: string }
  | {
      readonly kind: 'strong' | 'em' | 'underline' | 'del';
      readonly children: readonly MarkdownInline[];
    }
  | { readonly kind: 'code'; readonly text: string }
  | {
      readonly kind: 'link';
      readonly href: string | null;
      readonly title: string | null;
      readonly children: readonly MarkdownInline[];
    }
  | { readonly kind: 'br' }
  | { readonly kind: 'mention'; readonly id: string; readonly label: string };

/**
 * Interface MarkdownListItem
 *
 * @description
 * List item with optional task checkbox state.
 */
export interface MarkdownListItem {
  // #region Properties
  /**
   * Property task
   * @readonly
   *
   * @description
   * Whether the item is a task.
   *
   * @type {boolean}
   */
  readonly task: boolean;

  /**
   * Property checked
   * @readonly
   *
   * @description
   * Whether the task is checked.
   *
   * @type {boolean}
   */
  readonly checked: boolean;

  /**
   * Property label
   * @readonly
   *
   * @description
   * Plain text label for the checkbox.
   *
   * @type {string}
   */
  readonly label: string;

  /**
   * Property children
   * @readonly
   *
   * @description
   * Blocks contained by the list item.
   *
   * @type {readonly MarkdownBlock[]}
   */
  readonly children: readonly MarkdownBlock[];
  // #endregion
}

/**
 * Interface MarkdownCell
 *
 * @description
 * Table cell with its alignment and inline content.
 */
export interface MarkdownCell {
  // #region Properties
  /**
   * Property align
   * @readonly
   *
   * @description
   * Text alignment of the cell.
   *
   * @type {'start' | 'center' | 'end'}
   */
  readonly align: 'start' | 'center' | 'end';

  /**
   * Property children
   * @readonly
   *
   * @description
   * Inline content of the cell.
   *
   * @type {readonly MarkdownInline[]}
   */
  readonly children: readonly MarkdownInline[];
  // #endregion
}

/**
 * Type MarkdownBlock
 *
 * @description
 * Block-level Markdown rendering model.
 *
 * @type {MarkdownBlock}
 */
export type MarkdownBlock =
  | {
      readonly kind: 'heading';
      readonly level: number;
      readonly children: readonly MarkdownInline[];
    }
  | { readonly kind: 'paragraph' | 'text'; readonly children: readonly MarkdownInline[] }
  | {
      readonly kind: 'list';
      readonly ordered: boolean;
      readonly start: number;
      readonly task: boolean;
      readonly items: readonly MarkdownListItem[];
    }
  | { readonly kind: 'blockquote'; readonly children: readonly MarkdownBlock[] }
  | { readonly kind: 'code'; readonly text: string; readonly language: string | null }
  | { readonly kind: 'hr' }
  | {
      readonly kind: 'table';
      readonly header: readonly MarkdownCell[];
      readonly rows: readonly (readonly MarkdownCell[])[];
    };

/* The editor (`@tiptap/markdown`) writes `&`, `<` and `>` as entities and Paragraph writes `&nbsp;`
   for a kept blank line; marked keeps entities as they are in text tokens. */
/**
 * Constant NAMED
 *
 * @description
 * Supported named HTML character entities.
 *
 * @type {Record<string, string>}
 */
const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: String.fromCharCode(160),
};

/**
 * Constant ENTITY
 *
 * @description
 * Pattern for supported HTML character entities.
 *
 * @type {RegExp}
 */
const ENTITY: RegExp = /&(?:#(\d{1,7})|#[xX]([0-9a-fA-F]{1,6})|(amp|lt|gt|quot|apos|nbsp));/g;

/**
 * Function decodeEntities
 *
 * @description
 * Decodes supported character entities in text.
 *
 * @param {string} text - Text containing supported character entities.
 *
 * @returns {string} Text with recognized valid entities decoded.
 */
function decodeEntities(text: string): string {
  return text.replace(ENTITY, (match: string, dec?: string, hex?: string, name?: string) => {
    if (name) return NAMED[name];
    const code: number = dec !== undefined ? Number(dec) : parseInt(hex ?? '', 16);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });
}

/**
 * Constant SAFE_SCHEME
 *
 * @description
 * Allowed absolute URL schemes.
 *
 * @type {RegExp}
 */
const SAFE_SCHEME: RegExp = /^(?:https?|mailto|tel):/i;

/* Control characters, the space and DEL: browsers drop them from an address before reading it. */
/**
 * Function isDropped
 *
 * @description
 * Reports whether browsers discard a character from a URL.
 *
 * @param {string} char - Character to examine in a link address.
 *
 * @returns {boolean} Whether browsers discard the character when parsing an address.
 */
function isDropped(char: string): boolean {
  const code: number = char.charCodeAt(0);
  return code <= 32 || code === 127;
}

/**
 * Function safeHref
 *
 * @description
 * The address a link may point to: `http`, `https`, `mailto`, `tel` or a relative address; `null`
 * for anything else (`javascript:`, `data:`…). Characters browsers drop from an address are removed
 * before the scheme is read.
 *
 * @param {string} href - Untrusted Markdown link address.
 *
 * @returns {string | null} Trimmed safe address, or null for an empty or disallowed scheme.
 */
export function safeHref(href: string): string | null {
  const value: string = href.trim();
  if (value === '') return null;
  const compact: string = Array.from(value)
    .filter((char) => !isDropped(char))
    .join('');
  if (!/^[a-z][a-z0-9+.-]*:/i.test(compact)) return value;
  return SAFE_SCHEME.test(compact) ? value : null;
}

/**
 * Function plainText
 *
 * @description
 * Extracts plain text from inline pieces.
 *
 * @param {readonly MarkdownInline[]} nodes - Inline pieces from which to extract text.
 *
 * @returns {string} Plain text including mention labels and spaces for breaks.
 */
function plainText(nodes: readonly MarkdownInline[]): string {
  return nodes
    .map((node) => {
      switch (node.kind) {
        case 'text':
        case 'code':
          return node.text;
        case 'br':
          return ' ';
        case 'mention':
          return `@${node.label}`;
        default:
          return plainText(node.children);
      }
    })
    .join('');
}

/**
 * Function blocksText
 *
 * @description
 * Extracts plain text from block content.
 *
 * @param {readonly MarkdownBlock[]} blocks - Blocks from which to extract text.
 *
 * @returns {string} Trimmed plain text from text-bearing blocks.
 */
function blocksText(blocks: readonly MarkdownBlock[]): string {
  return blocks
    .map((block) =>
      block.kind === 'heading' || block.kind === 'paragraph' || block.kind === 'text'
        ? plainText(block.children)
        : '',
    )
    .join(' ')
    .trim();
}

/* marked types a token either as its own interface or as `Tokens.Generic` (fields of type any):
   shared fields are read through these typed accessors. */
/**
 * Function textOf
 *
 * @description
 * Reads text from a Markdown token.
 *
 * @param {Token} token - Markdown token whose text field is read.
 *
 * @returns {string} Token text, or an empty string when unavailable.
 */
function textOf(token: Token): string {
  const value: unknown = (token as Tokens.Generic)['text'];
  return typeof value === 'string' ? value : '';
}

/**
 * Function childrenOf
 *
 * @description
 * Reads child tokens from a Markdown token.
 *
 * @param {Token} token - Markdown token whose child tokens are read.
 *
 * @returns {Token[]} Child tokens, or an empty array when unavailable.
 */
function childrenOf(token: Token): Token[] {
  const value: unknown = (token as Tokens.Generic).tokens;
  return Array.isArray(value) ? (value as Token[]) : [];
}

/**
 * Function toInline
 *
 * @description
 * Converts inline tokens, preserving children or text from unknown tokens.
 *
 * @param {readonly Token[]} tokens - Inline lexer tokens to convert.
 *
 * @returns {MarkdownInline[]} Inline rendering models preserving recognized marks and safe links.
 */
export function toInline(tokens: readonly Token[]): MarkdownInline[] {
  const out: MarkdownInline[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case 'text': {
        const children: Token[] = childrenOf(token);
        if (children.length) out.push(...toInline(children));
        else out.push({ kind: 'text', text: decodeEntities(textOf(token)) });
        break;
      }
      case 'escape':
        out.push({ kind: 'text', text: textOf(token) });
        break;
      case 'strong':
        // Cadenway grammar: `__text__` is underline even where marked's own rule takes it.
        out.push({
          kind: token.raw.startsWith('__') ? 'underline' : 'strong',
          children: toInline(childrenOf(token)),
        });
        break;
      case 'em':
        out.push({ kind: 'em', children: toInline(childrenOf(token)) });
        break;
      case 'del':
        out.push({ kind: 'del', children: toInline(childrenOf(token)) });
        break;
      case 'underline':
        out.push({ kind: 'underline', children: toInline(childrenOf(token)) });
        break;
      case 'codespan':
        out.push({ kind: 'code', text: textOf(token) });
        break;
      case 'link':
      case 'image': {
        const link: Tokens.Link | Tokens.Image = token as Tokens.Link | Tokens.Image;
        // An image shows as a link to its address, named by its alternative text: no remote
        // content is loaded from a comment or a description.
        out.push({
          kind: 'link',
          href: safeHref(link.href),
          title: link.title ?? null,
          children:
            link.type === 'image'
              ? [{ kind: 'text', text: link.text === '' ? link.href : link.text }]
              : toInline(link.tokens),
        });
        break;
      }
      case 'br':
        out.push({ kind: 'br' });
        break;
      case 'mention': {
        const mention: ɵMentionToken = token as ɵMentionToken;
        out.push({ kind: 'mention', id: mention.id, label: mention.label });
        break;
      }
      case 'html':
        // Never injected: the markup shows as the text it is.
        out.push({ kind: 'text', text: token.raw });
        break;
      case 'checkbox':
        break;
      default: {
        const children: Token[] = childrenOf(token);
        if (children.length) out.push(...toInline(children));
        else out.push({ kind: 'text', text: decodeEntities(textOf(token)) });
      }
    }
  }
  return out;
}

/**
 * Constant ALIGN
 *
 * @description
 * Mapping from Markdown table alignment to display alignment.
 *
 * @type {{ readonly left: 'start'; readonly center: 'center'; readonly right: 'end' }}
 */
const ALIGN: { readonly left: 'start'; readonly center: 'center'; readonly right: 'end' } = {
  left: 'start',
  center: 'center',
  right: 'end',
} as const;

/**
 * Function toCell
 *
 * @description
 * Converts a Markdown table cell to the rendering model.
 *
 * @param {Tokens.TableCell} cell - Lexer table cell to convert.
 *
 * @returns {MarkdownCell} Cell rendering model with alignment and inline content.
 */
function toCell(cell: Tokens.TableCell): MarkdownCell {
  return { align: cell.align ? ALIGN[cell.align] : 'start', children: toInline(cell.tokens) };
}

/**
 * Function codeLanguage
 *
 * @description
 * Extracts a code block language when present.
 *
 * @param {Token} token - Code block token whose language is read.
 *
 * @returns {string | null} First language token, or null when none is supplied.
 */
function codeLanguage(token: Token): string | null {
  const language: string = (token as Tokens.Code).lang?.trim().split(/\s+/)[0] ?? '';
  return language === '' ? null : language;
}

/**
 * Function toBlocks
 *
 * @description
 * Converts block tokens while dropping spaces and link definitions.
 *
 * @param {readonly Token[]} tokens - Block lexer tokens to convert.
 *
 * @returns {MarkdownBlock[]} Block rendering models with spaces and link definitions omitted.
 */
export function toBlocks(tokens: readonly Token[]): MarkdownBlock[] {
  const out: MarkdownBlock[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case 'space':
      case 'def':
        break;
      case 'heading':
        out.push({
          kind: 'heading',
          level: Math.min(Math.max((token as Tokens.Heading).depth, 1), 6),
          children: toInline(childrenOf(token)),
        });
        break;
      case 'paragraph':
        out.push({ kind: 'paragraph', children: toInline(childrenOf(token)) });
        break;
      case 'text': {
        const children: Token[] = childrenOf(token);
        out.push({
          kind: 'text',
          children: children.length
            ? toInline(children)
            : [{ kind: 'text', text: decodeEntities(textOf(token)) }],
        });
        break;
      }
      case 'list': {
        const list: Tokens.List = token as Tokens.List;
        const items: MarkdownListItem[] = list.items.map((item): MarkdownListItem => {
          const children: MarkdownBlock[] = toBlocks(
            item.tokens.filter((child) => child.type !== 'checkbox'),
          );
          return {
            task: item.task,
            checked: item.checked === true,
            label: blocksText(children),
            children,
          };
        });
        out.push({
          kind: 'list',
          ordered: list.ordered,
          start: typeof list.start === 'number' ? list.start : 1,
          task: items.length > 0 && items.every((item) => item.task),
          items,
        });
        break;
      }
      case 'blockquote':
        out.push({ kind: 'blockquote', children: toBlocks(childrenOf(token)) });
        break;
      case 'code':
        out.push({ kind: 'code', text: textOf(token), language: codeLanguage(token) });
        break;
      case 'hr':
        out.push({ kind: 'hr' });
        break;
      case 'table': {
        const table: Tokens.Table = token as Tokens.Table;
        out.push({
          kind: 'table',
          header: table.header.map(toCell),
          rows: table.rows.map((row) => row.map(toCell)),
        });
        break;
      }
      case 'html':
        // Never injected: a block of markup shows as a paragraph of text.
        out.push({ kind: 'paragraph', children: [{ kind: 'text', text: token.raw.trim() }] });
        break;
      default: {
        const children: Token[] = childrenOf(token);
        out.push({
          kind: 'paragraph',
          children: children.length
            ? toInline(children)
            : [{ kind: 'text', text: decodeEntities(textOf(token)) }],
        });
      }
    }
  }
  return out;
}
