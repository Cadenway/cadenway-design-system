/*
 * The one Markdown grammar of Cadenway: the `marked` instance that `cw-markdown` reads with and that
 * `cw-block-editor` parses with (`Markdown.configure({ marked })`), so what the editor saves is what
 * the reader shows (cw-brick-recipes, `cw-markdown`). Shared with `@cadenway/ui/components/block-editor`
 * through the `ɵ` exports of the public API; not public API.
 */

import { Marked, type TokenizerExtension, type Tokens } from 'marked';

/* Cadenway reads and writes `__text__` as underline; bold is `**text**` only (mockup App.dc.html,
   `MD_MARKS`). CommonMark would read `__text__` as strong: this inline rule runs before marked's own
   emphasis tokenizer, at every position where `__` starts. */
/**
 * Constant UNDERLINE
 *
 * @description
 * Pattern matching Cadenway underline syntax.
 *
 * @type {RegExp}
 */
const UNDERLINE: RegExp = /^__(?=\S)([\s\S]*?\S)__(?!_)/;

/* A mention: `@[Karim Benali](user-id)`. The label escapes `\` and `]`; the id is URI-encoded
   (parentheses included), so it never holds a space or a parenthesis. */
/**
 * Constant MENTION
 *
 * @description
 * Pattern matching Cadenway mention syntax.
 *
 * @type {RegExp}
 */
const MENTION: RegExp = /^@\[((?:\\.|[^\]\\\n])+)\]\(([^()\s]+)\)/;

/**
 * Interface ɵUnderlineToken
 *
 * @description
 * Token representing underlined text.
 */
export interface ɵUnderlineToken extends Tokens.Generic {
  // #region Properties
  /**
   * Property type
   * @readonly
   *
   * @description
   * Token discriminator for underline.
   *
   * @type {'underline'}
   */
  readonly type: 'underline';

  /**
   * Property text
   * @readonly
   *
   * @description
   * Text inside the underline.
   *
   * @type {string}
   */
  readonly text: string;

  /**
   * Property tokens
   * @readonly
   *
   * @description
   * Inline tokens contained by the underline.
   *
   * @type {Tokens.Generic[]}
   */
  readonly tokens: Tokens.Generic[];
  // #endregion
}

/**
 * Interface ɵMentionToken
 *
 * @description
 * Token representing a user mention.
 */
export interface ɵMentionToken extends Tokens.Generic {
  // #region Properties
  /**
   * Property type
   * @readonly
   *
   * @description
   * Token discriminator for mentions.
   *
   * @type {'mention'}
   */
  readonly type: 'mention';

  /**
   * Property id
   * @readonly
   *
   * @description
   * Identifier of the mentioned user.
   *
   * @type {string}
   */
  readonly id: string;

  /**
   * Property label
   * @readonly
   *
   * @description
   * Displayed label of the mentioned user.
   *
   * @type {string}
   */
  readonly label: string;
  // #endregion
}

/**
 * Function startOf
 *
 * @description
 * Finds the first occurrence of a tokenizer marker.
 *
 * @param {string} source - Source text being tokenized.
 * @param {string} marker - Marker whose first occurrence is sought.
 *
 * @returns {number | undefined} Marker position, or undefined when absent.
 */
function startOf(source: string, marker: string): number | undefined {
  const index: number = source.indexOf(marker);
  return index < 0 ? undefined : index;
}

/**
 * Function decodeId
 *
 * @description
 * Decodes a mention identifier when URI encoding is valid.
 *
 * @param {string} id - URI-encoded mention identifier.
 *
 * @returns {string} Decoded identifier, or the original value when decoding fails.
 */
function decodeId(id: string): string {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

/**
 * Constant underline
 *
 * @description
 * Marked tokenizer for underline syntax.
 *
 * @type {TokenizerExtension}
 */
const underline: TokenizerExtension = {
  name: 'underline',
  level: 'inline',
  start: (source) => startOf(source, '__'),
  tokenizer(source): ɵUnderlineToken | undefined {
    const match: RegExpExecArray | null = UNDERLINE.exec(source);
    if (!match) return undefined;
    return {
      type: 'underline',
      raw: match[0],
      text: match[1],
      tokens: this.lexer.inlineTokens(match[1]),
    };
  },
};

/**
 * Constant mention
 *
 * @description
 * Marked tokenizer for mention syntax.
 *
 * @type {TokenizerExtension}
 */
const mention: TokenizerExtension = {
  name: 'mention',
  level: 'inline',
  start: (source) => startOf(source, '@['),
  tokenizer(source): ɵMentionToken | undefined {
    const match: RegExpExecArray | null = MENTION.exec(source);
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
 * Function ɵcreateMarked
 *
 * @description
 * Creates a `marked` instance configured with the Cadenway grammar: GitHub-flavored Markdown, a line
 * break inside a paragraph kept as a break (the mockup stores one block per line), the
 * `__underline__` rule and the `@[label](id)` mention rule.
 *
 * Each call returns a new instance: `@tiptap/markdown` registers its own tokenizers on the instance
 * it is given (`marked.use`), which must not leak into the reader. Use only the lexer of the
 * result (`lexer()`), never `parse()`: no HTML is ever produced from Markdown.
 *
 * @returns {Marked} Fresh lexer configured for the Cadenway Markdown grammar.
 */
export function ɵcreateMarked(): Marked {
  return new Marked({ gfm: true, breaks: true }, { extensions: [underline, mention] });
}

/**
 * Function ɵwriteMention
 *
 * @description
 * Writes a mention in the shared grammar, `@[label](id)`, escaping the label and encoding the id so
 * that `ɵcreateMarked()` reads back the same id and label.
 *
 * @param {string} id - Identifier to encode in the mention.
 * @param {string} label - Visible mention label to escape.
 *
 * @returns {string} Mention syntax that round-trips through the shared lexer.
 */
export function ɵwriteMention(id: string, label: string): string {
  const safeLabel: string = label.replace(/[\\\]]/g, '\\$&').replace(/\n/g, ' ');
  const safeId: string = encodeURIComponent(id).replace(
    /[()!*']/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `@[${safeLabel}](${safeId})`;
}
