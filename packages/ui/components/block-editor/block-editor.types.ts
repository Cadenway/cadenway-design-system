import type { Observable } from 'rxjs';

/**
 * Type CwBlockKind
 *
 * @description
 * A block type of the editor (mockup App.dc.html, `BLOCK_TYPES`): text, three heading levels, bullet, numbered and task lists, quote, code block and separator.
 *
 * @type {'p' | 'h1' | 'h2' | 'h3' | 'li' | 'ol' | 'todo' | 'quote' | 'code' | 'hr'}
 */
export type CwBlockKind = 'p' | 'h1' | 'h2' | 'h3' | 'li' | 'ol' | 'todo' | 'quote' | 'code' | 'hr';

/**
 * Interface CwBlockType
 *
 * @description
 * An entry of the « / » menu: the block it inserts, its label, icon and Markdown hint.
 */
export interface CwBlockType {
  // #region Properties
  /**
   * Property kind
   *
   * @description
   * The block the entry turns the current line into.
   *
   * @type {CwBlockKind}
   * @readonly
   */
  readonly kind: CwBlockKind;

  /**
   * Property label
   *
   * @description
   * Visible label (« Titre 1 »); the menu filters on it.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property icon
   *
   * @description
   * Leading icon, an ng-icons name registered by the editor or the app; none when omitted.
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly icon?: string;

  /**
   * Property hint
   *
   * @description
   * The Markdown shorthand shown on the right (`#`, `-`, `1.`); none when empty.
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly hint?: string;
  // #endregion
}

/**
 * Type CwInlineMark
 *
 * @description
 * An inline mark of the formatting toolbar and its shortcut.
 *
 * @type {'bold' | 'italic' | 'underline' | 'strike' | 'code'}
 */
export type CwInlineMark = 'bold' | 'italic' | 'underline' | 'strike' | 'code';

/**
 * Interface CwInlineMarkButton
 *
 * @description
 * A button of the formatting toolbar for an inline mark (mockup App.dc.html, `MARK_BTNS`).
 */
export interface CwInlineMarkButton {
  // #region Properties
  /**
   * Property mark
   *
   * @description
   * The mark it toggles.
   *
   * @type {CwInlineMark}
   * @readonly
   */
  readonly mark: CwInlineMark;

  /**
   * Property label
   *
   * @description
   * Accessible name and tooltip (« Gras »).
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property icon
   *
   * @description
   * Its ng-icons name.
   *
   * @type {string}
   * @readonly
   */
  readonly icon: string;

  /**
   * Property shortcut
   *
   * @description
   * The keys shown in its tooltip (`['Ctrl', 'B']`).
   *
   * @type {readonly string[]}
   * @readonly
   */
  readonly shortcut: readonly string[];
  // #endregion
}

/**
 * Interface CwMentionPerson
 *
 * @description
 * A person offered after « @ »: inserted as `@[name](id)`.
 */
export interface CwMentionPerson {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable id written in the Markdown and reported by `mentions()`.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property name
   *
   * @description
   * Full name, shown after `@`.
   *
   * @type {string}
   * @readonly
   */
  readonly name: string;

  /**
   * Property role
   *
   * @description
   * Short role shown on the right of the option (« Design »).
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly role?: string;

  /**
   * Property src
   *
   * @description
   * Avatar picture; initials otherwise.
   *
   * @type {string | null | undefined}
   * @readonly
   */
  readonly src?: string | null;
  // #endregion
}

/**
 * Type CwMentionSearch
 *
 * @description
 * Looks people up for the « @ » menu; the first emitted list is shown.
 *
 * @type {(query: string) => Observable<readonly CwMentionPerson[]>}
 */
export type CwMentionSearch = (query: string) => Observable<readonly CwMentionPerson[]>;

/**
 * Type CwBlockEditorVariant
 *
 * @description
 * Layout of the editable surface: `document` (full page, no padding, blocks spaced), `field` (inside a framed field: padded, 56 px high at least, 240 px at most then scrolls), `line` (one 36 px line, the compact comment composer at rest).
 *
 * @type {'document' | 'field' | 'line'}
 */
export type CwBlockEditorVariant = 'document' | 'field' | 'line';

/**
 * Interface CwBlockEditorLabels
 *
 * @description
 * French texts of the editor, all overridable through `labels`.
 */
export interface CwBlockEditorLabels {
  // #region Properties
  /**
   * Property toolbar
   *
   * @description
   * Name of the formatting toolbar.
   *
   * @type {string}
   * @readonly
   */
  readonly toolbar: string;

  /**
   * Property blockType
   *
   * @description
   * Name of the block type menu of the toolbar.
   *
   * @type {string}
   * @readonly
   */
  readonly blockType: string;

  /**
   * Property blockMenu
   *
   * @description
   * Title of the « / » menu.
   *
   * @type {string}
   * @readonly
   */
  readonly blockMenu: string;

  /**
   * Property mentionMenu
   *
   * @description
   * Title of the « @ » menu.
   *
   * @type {string}
   * @readonly
   */
  readonly mentionMenu: string;

  /**
   * Property noResults
   *
   * @description
   * Shown when the menu matches nothing.
   *
   * @type {string}
   * @readonly
   */
  readonly noResults: string;

  /**
   * Property oneResult
   *
   * @description
   * Announced when the menu shows one result.
   *
   * @type {string}
   * @readonly
   */
  readonly oneResult: string;

  /**
   * Property manyResults
   *
   * @description
   * Announced when the menu shows several results; `{count}` is replaced.
   *
   * @type {string}
   * @readonly
   */
  readonly manyResults: string;

  /**
   * Property choose
   *
   * @description
   * Keyboard help of the « @ » menu: the arrows.
   *
   * @type {string}
   * @readonly
   */
  readonly choose: string;

  /**
   * Property insert
   *
   * @description
   * Keyboard help of the « @ » menu: Enter.
   *
   * @type {string}
   * @readonly
   */
  readonly insert: string;

  /**
   * Property up
   *
   * @description
   * Name of the up arrow key in the help.
   *
   * @type {string}
   * @readonly
   */
  readonly up: string;

  /**
   * Property down
   *
   * @description
   * Name of the down arrow key in the help.
   *
   * @type {string}
   * @readonly
   */
  readonly down: string;

  /**
   * Property enter
   *
   * @description
   * Name of the Enter key in the help.
   *
   * @type {string}
   * @readonly
   */
  readonly enter: string;

  /**
   * Property link
   *
   * @description
   * Name of the link button.
   *
   * @type {string}
   * @readonly
   */
  readonly link: string;

  /**
   * Property linkPanel
   *
   * @description
   * Name of the link panel.
   *
   * @type {string}
   * @readonly
   */
  readonly linkPanel: string;

  /**
   * Property linkUrl
   *
   * @description
   * Name of the address field of the link panel.
   *
   * @type {string}
   * @readonly
   */
  readonly linkUrl: string;

  /**
   * Property linkPlaceholder
   *
   * @description
   * Placeholder of the address field.
   *
   * @type {string}
   * @readonly
   */
  readonly linkPlaceholder: string;

  /**
   * Property linkApply
   *
   * @description
   * The button that applies the link.
   *
   * @type {string}
   * @readonly
   */
  readonly linkApply: string;

  /**
   * Property emptyBlock
   *
   * @description
   * Placeholder of an empty paragraph that is not the only block.
   *
   * @type {string}
   * @readonly
   */
  readonly emptyBlock: string;

  /**
   * Property check
   *
   * @description
   * Name of a task box to tick; `{text}` is replaced by the task.
   *
   * @type {string}
   * @readonly
   */
  readonly check: string;

  /**
   * Property uncheck
   *
   * @description
   * Name of a ticked task box; `{text}` is replaced by the task.
   *
   * @type {string}
   * @readonly
   */
  readonly uncheck: string;

  /**
   * Property task
   *
   * @description
   * The task word when the task has no text.
   *
   * @type {string}
   * @readonly
   */
  readonly task: string;
  // #endregion
}
