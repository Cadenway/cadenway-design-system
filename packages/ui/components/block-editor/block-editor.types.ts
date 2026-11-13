import type { Observable } from 'rxjs';

/**
 * A block type of the editor (mockup App.dc.html, `BLOCK_TYPES`): text, three heading levels,
 * bullet, numbered and task lists, quote, code block and separator.
 */
export type CwBlockKind = 'p' | 'h1' | 'h2' | 'h3' | 'li' | 'ol' | 'todo' | 'quote' | 'code' | 'hr';

/** An entry of the « / » menu: the block it inserts, its label, icon and Markdown hint. */
export interface CwBlockType {
  /** The block the entry turns the current line into. */
  readonly kind: CwBlockKind;
  /** Visible label (« Titre 1 »); the menu filters on it. */
  readonly label: string;
  /** Leading icon, an ng-icons name registered by the editor or the app; none when omitted. */
  readonly icon?: string;
  /** The Markdown shorthand shown on the right (`#`, `-`, `1.`); none when empty. */
  readonly hint?: string;
}

/** An inline mark of the formatting toolbar and its shortcut. */
export type CwInlineMark = 'bold' | 'italic' | 'underline' | 'strike' | 'code';

/** A button of the formatting toolbar for an inline mark (mockup App.dc.html, `MARK_BTNS`). */
export interface CwInlineMarkButton {
  /** The mark it toggles. */
  readonly mark: CwInlineMark;
  /** Accessible name and tooltip (« Gras »). */
  readonly label: string;
  /** Its ng-icons name. */
  readonly icon: string;
  /** The keys shown in its tooltip (`['Ctrl', 'B']`). */
  readonly shortcut: readonly string[];
}

/** A person offered after « @ »: inserted as `@[name](id)`. */
export interface CwMentionPerson {
  /** Stable id written in the Markdown and reported by `mentions()`. */
  readonly id: string;
  /** Full name, shown after `@`. */
  readonly name: string;
  /** Short role shown on the right of the option (« Design »). */
  readonly role?: string;
  /** Avatar picture; initials otherwise. */
  readonly src?: string | null;
}

/** Looks people up for the « @ » menu; the first emitted list is shown. */
export type CwMentionSearch = (query: string) => Observable<readonly CwMentionPerson[]>;

/**
 * Layout of the editable surface: `document` (full page, no padding, blocks spaced), `field`
 * (inside a framed field: padded, 56 px high at least, 240 px at most then scrolls), `line` (one
 * 36 px line, the compact comment composer at rest).
 */
export type CwBlockEditorVariant = 'document' | 'field' | 'line';

/** French texts of the editor, all overridable through `labels`. */
export interface CwBlockEditorLabels {
  /** Name of the formatting toolbar. */
  readonly toolbar: string;
  /** Name of the block type menu of the toolbar. */
  readonly blockType: string;
  /** Title of the « / » menu. */
  readonly blockMenu: string;
  /** Title of the « @ » menu. */
  readonly mentionMenu: string;
  /** Shown when the menu matches nothing. */
  readonly noResults: string;
  /** Announced when the menu shows one result. */
  readonly oneResult: string;
  /** Announced when the menu shows several results; `{count}` is replaced. */
  readonly manyResults: string;
  /** Keyboard help of the « @ » menu: the arrows. */
  readonly choose: string;
  /** Keyboard help of the « @ » menu: Enter. */
  readonly insert: string;
  /** Name of the up arrow key in the help. */
  readonly up: string;
  /** Name of the down arrow key in the help. */
  readonly down: string;
  /** Name of the Enter key in the help. */
  readonly enter: string;
  /** Name of the link button. */
  readonly link: string;
  /** Name of the link panel. */
  readonly linkPanel: string;
  /** Name of the address field of the link panel. */
  readonly linkUrl: string;
  /** Placeholder of the address field. */
  readonly linkPlaceholder: string;
  /** The button that applies the link. */
  readonly linkApply: string;
  /** Placeholder of an empty paragraph that is not the only block. */
  readonly emptyBlock: string;
  /** Name of a task box to tick; `{text}` is replaced by the task. */
  readonly check: string;
  /** Name of a ticked task box; `{text}` is replaced by the task. */
  readonly uncheck: string;
  /** The task word when the task has no text. */
  readonly task: string;
}
