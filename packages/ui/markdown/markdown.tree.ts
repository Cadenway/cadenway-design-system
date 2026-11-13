/*
 * Turns the `marked` token tree into the view model `cw-markdown` renders, one kind per branch of
 * its templates. Internal to the entry point. Nothing here produces HTML: an `html` token becomes
 * text, a link keeps only a safe address.
 */

import type { Token, Tokens } from 'marked';

import type { ɵMentionToken } from './markdown.marked';

/** An inline piece of a block: text, a mark around other pieces, code, a link, a break, a mention. */
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

/** An item of a list; a task item carries its checkbox state and a plain-text name for it. */
export interface MarkdownListItem {
  readonly task: boolean;
  readonly checked: boolean;
  readonly label: string;
  readonly children: readonly MarkdownBlock[];
}

/** A cell of a table, with its column alignment. */
export interface MarkdownCell {
  readonly align: 'start' | 'center' | 'end';
  readonly children: readonly MarkdownInline[];
}

/** A block of the document. `text` is the bare text of a tight list item (no paragraph). */
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
const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: String.fromCharCode(160),
};

const ENTITY = /&(?:#(\d{1,7})|#[xX]([0-9a-fA-F]{1,6})|(amp|lt|gt|quot|apos|nbsp));/g;

function decodeEntities(text: string): string {
  return text.replace(ENTITY, (match: string, dec?: string, hex?: string, name?: string) => {
    if (name) return NAMED[name];
    const code = dec !== undefined ? Number(dec) : parseInt(hex ?? '', 16);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });
}

const SAFE_SCHEME = /^(?:https?|mailto|tel):/i;

/* Control characters, the space and DEL: browsers drop them from an address before reading it. */
function isDropped(char: string): boolean {
  const code = char.charCodeAt(0);
  return code <= 32 || code === 127;
}

/**
 * The address a link may point to: `http`, `https`, `mailto`, `tel` or a relative address; `null`
 * for anything else (`javascript:`, `data:`…). Characters browsers drop from an address are removed
 * before the scheme is read.
 */
export function safeHref(href: string): string | null {
  const value = href.trim();
  if (value === '') return null;
  const compact = Array.from(value)
    .filter((char) => !isDropped(char))
    .join('');
  if (!/^[a-z][a-z0-9+.-]*:/i.test(compact)) return value;
  return SAFE_SCHEME.test(compact) ? value : null;
}

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
function textOf(token: Token): string {
  const value: unknown = (token as Tokens.Generic)['text'];
  return typeof value === 'string' ? value : '';
}

function childrenOf(token: Token): Token[] {
  const value: unknown = (token as Tokens.Generic).tokens;
  return Array.isArray(value) ? (value as Token[]) : [];
}

/** Converts inline tokens; unknown tokens with children keep their children, others their text. */
export function toInline(tokens: readonly Token[]): MarkdownInline[] {
  const out: MarkdownInline[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case 'text': {
        const children = childrenOf(token);
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
        const link = token as Tokens.Link | Tokens.Image;
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
        const mention = token as ɵMentionToken;
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
        const children = childrenOf(token);
        if (children.length) out.push(...toInline(children));
        else out.push({ kind: 'text', text: decodeEntities(textOf(token)) });
      }
    }
  }
  return out;
}

const ALIGN = { left: 'start', center: 'center', right: 'end' } as const;

function toCell(cell: Tokens.TableCell): MarkdownCell {
  return { align: cell.align ? ALIGN[cell.align] : 'start', children: toInline(cell.tokens) };
}

function codeLanguage(token: Token): string | null {
  const language = (token as Tokens.Code).lang?.trim().split(/\s+/)[0] ?? '';
  return language === '' ? null : language;
}

/** Converts block tokens; `space` and link definitions are dropped. */
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
        const children = childrenOf(token);
        out.push({
          kind: 'text',
          children: children.length
            ? toInline(children)
            : [{ kind: 'text', text: decodeEntities(textOf(token)) }],
        });
        break;
      }
      case 'list': {
        const list = token as Tokens.List;
        const items = list.items.map((item): MarkdownListItem => {
          const children = toBlocks(item.tokens.filter((child) => child.type !== 'checkbox'));
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
        const table = token as Tokens.Table;
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
        const children = childrenOf(token);
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
