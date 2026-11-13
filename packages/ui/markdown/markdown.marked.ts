/*
 * The one Markdown grammar of Cadenway: the `marked` instance that `cw-markdown` reads with and that
 * `cw-block-editor` parses with (`Markdown.configure({ marked })`), so what the editor saves is what
 * the reader shows (cw-brick-recipes, `cw-markdown`). Shared with `@cadenway/ui/block-editor`
 * through the `ɵ` exports of the public API; not public API.
 */

import { Marked, type TokenizerExtension, type Tokens } from 'marked';

/* Cadenway reads and writes `__text__` as underline; bold is `**text**` only (mockup App.dc.html,
   `MD_MARKS`). CommonMark would read `__text__` as strong: this inline rule runs before marked's own
   emphasis tokenizer, at every position where `__` starts. */
const UNDERLINE = /^__(?=\S)([\s\S]*?\S)__(?!_)/;

/* A mention: `@[Karim Benali](user-id)`. The label escapes `\` and `]`; the id is URI-encoded
   (parentheses included), so it never holds a space or a parenthesis. */
const MENTION = /^@\[((?:\\.|[^\]\\\n])+)\]\(([^()\s]+)\)/;

/** A token of the shared `__underline__` rule. */
export interface ɵUnderlineToken extends Tokens.Generic {
  readonly type: 'underline';
  readonly text: string;
  readonly tokens: Tokens.Generic[];
}

/** A token of the shared mention rule: the person's id and the label shown after `@`. */
export interface ɵMentionToken extends Tokens.Generic {
  readonly type: 'mention';
  readonly id: string;
  readonly label: string;
}

function startOf(source: string, marker: string): number | undefined {
  const index = source.indexOf(marker);
  return index < 0 ? undefined : index;
}

function decodeId(id: string): string {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

const underline: TokenizerExtension = {
  name: 'underline',
  level: 'inline',
  start: (source) => startOf(source, '__'),
  tokenizer(source): ɵUnderlineToken | undefined {
    const match = UNDERLINE.exec(source);
    if (!match) return undefined;
    return {
      type: 'underline',
      raw: match[0],
      text: match[1],
      tokens: this.lexer.inlineTokens(match[1]),
    };
  },
};

const mention: TokenizerExtension = {
  name: 'mention',
  level: 'inline',
  start: (source) => startOf(source, '@['),
  tokenizer(source): ɵMentionToken | undefined {
    const match = MENTION.exec(source);
    if (!match) return undefined;
    return {
      type: 'mention',
      raw: match[0],
      label: match[1].replace(/\\(.)/g, '$1'),
      id: decodeId(match[2]),
    };
  },
};

/**
 * Creates a `marked` instance configured with the Cadenway grammar: GitHub-flavored Markdown, a line
 * break inside a paragraph kept as a break (the mockup stores one block per line), the
 * `__underline__` rule and the `@[label](id)` mention rule.
 *
 * Each call returns a new instance: `@tiptap/markdown` registers its own tokenizers on the instance
 * it is given (`marked.use`), which must not leak into the reader. Use only the lexer of the
 * result (`lexer()`), never `parse()`: no HTML is ever produced from Markdown.
 */
export function ɵcreateMarked(): Marked {
  return new Marked({ gfm: true, breaks: true }, { extensions: [underline, mention] });
}

/**
 * Writes a mention in the shared grammar, `@[label](id)`, escaping the label and encoding the id so
 * that `ɵcreateMarked()` reads back the same id and label.
 */
export function ɵwriteMention(id: string, label: string): string {
  const safeLabel = label.replace(/[\\\]]/g, '\\$&').replace(/\n/g, ' ');
  const safeId = encodeURIComponent(id).replace(
    /[()!*']/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `@[${safeLabel}](${safeId})`;
}
