import type { CwAttachmentState } from '@cadenway/ui/components/attachment';
import type { CwBlockType, CwMentionPerson } from '@cadenway/ui/components/block-editor';

/**
 * Type CwCommentComposerVariant
 *
 * @description
 * `full`: complete toolbar, Ctrl Entrée help, avatar; `compact`: one 36 px line that grows on focus.
 *
 * @type {'full' | 'compact'}
 */
export type CwCommentComposerVariant = 'full' | 'compact';

/**
 * Type CwCommentComposerMode
 *
 * @description
 * `create` sends a new comment (Envoyer); `edit` saves an existing one (Annuler, Enregistrer).
 *
 * @type {'create' | 'edit'}
 */
export type CwCommentComposerMode = 'create' | 'edit';

/**
 * Type CwPerson
 *
 * @description
 * A person: the author shown on the left, or someone offered after « @ ».
 *
 * @type {CwMentionPerson}
 */
export type CwPerson = CwMentionPerson;

/**
 * Type CwComposerCommand
 *
 * @description
 * A block offered after « / » at the start of a line.
 *
 * @type {CwBlockType}
 */
export type CwComposerCommand = CwBlockType;

/**
 * Interface CwAttachmentDraft
 *
 * @description
 * A file joined to the comment and the state of its upload, shown as a compact `cw-attachment`.
 */
export interface CwAttachmentDraft {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable id, reported by `submit` and `attachmentRemove`.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property name
   *
   * @description
   * File name.
   *
   * @type {string}
   * @readonly
   */
  readonly name: string;

  /**
   * Property mimeType
   *
   * @description
   * MIME type, for the icon.
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly mimeType?: string;

  /**
   * Property fileSize
   *
   * @description
   * Size in bytes.
   *
   * @type {number | null | undefined}
   * @readonly
   */
  readonly fileSize?: number | null;

  /**
   * Property state
   *
   * @description
   * Upload state; the comment waits for `uploading` and `processing` to end.
   *
   * @type {CwAttachmentState}
   * @readonly
   */
  readonly state: CwAttachmentState;

  /**
   * Property progress
   *
   * @description
   * Upload progress, 0 to 100.
   *
   * @type {number | undefined}
   * @readonly
   */
  readonly progress?: number;

  /**
   * Property href
   *
   * @description
   * Address of the uploaded file.
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly href?: string;

  /**
   * Property error
   *
   * @description
   * Message of a failed upload.
   *
   * @type {string | undefined}
   * @readonly
   */
  readonly error?: string;
  // #endregion
}

/**
 * Interface CwCommentSubmit
 *
 * @description
 * What `submit` carries: the Markdown, the mentioned people's ids, the uploaded files' ids.
 */
export interface CwCommentSubmit {
  // #region Properties
  /**
   * Property markdown
   *
   * @description
   * Comment body in Markdown.
   *
   * @type {string}
   * @readonly
   */
  readonly markdown: string;

  /**
   * Property mentions
   *
   * @description
   * Identifiers of mentioned people.
   *
   * @type {readonly string[]}
   * @readonly
   */
  readonly mentions: readonly string[];

  /**
   * Property attachments
   *
   * @description
   * Identifiers of uploaded attachments.
   *
   * @type {readonly string[]}
   * @readonly
   */
  readonly attachments: readonly string[];
  // #endregion
}

/**
 * Interface CwCommentComposerLabels
 *
 * @description
 * French texts of the composer, all overridable through `labels`.
 */
export interface CwCommentComposerLabels {
  // #region Properties
  /**
   * Property editor
   *
   * @description
   * Name of the text area.
   *
   * @type {string}
   * @readonly
   */
  readonly editor: string;

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
   * Property formatting
   *
   * @description
   * The menu that holds the formatting buttons when the bar is narrow.
   *
   * @type {string}
   * @readonly
   */
  readonly formatting: string;

  /**
   * Property bold
   *
   * @description
   * Label for bold formatting.
   *
   * @type {string}
   * @readonly
   */
  readonly bold: string;

  /**
   * Property italic
   *
   * @description
   * Label for italic formatting.
   *
   * @type {string}
   * @readonly
   */
  readonly italic: string;

  /**
   * Property link
   *
   * @description
   * Label for inserting a link.
   *
   * @type {string}
   * @readonly
   */
  readonly link: string;

  /**
   * Property bulletList
   *
   * @description
   * Label for a bulleted list.
   *
   * @type {string}
   * @readonly
   */
  readonly bulletList: string;

  /**
   * Property code
   *
   * @description
   * Label for code formatting.
   *
   * @type {string}
   * @readonly
   */
  readonly code: string;

  /**
   * Property mention
   *
   * @description
   * The button that inserts « @ ».
   *
   * @type {string}
   * @readonly
   */
  readonly mention: string;

  /**
   * Property attach
   *
   * @description
   * The button that opens the file chooser.
   *
   * @type {string}
   * @readonly
   */
  readonly attach: string;

  /**
   * Property send
   *
   * @description
   * Label for sending a new comment.
   *
   * @type {string}
   * @readonly
   */
  readonly send: string;

  /**
   * Property save
   *
   * @description
   * Label for saving an edited comment.
   *
   * @type {string}
   * @readonly
   */
  readonly save: string;

  /**
   * Property cancel
   *
   * @description
   * Label for cancelling an edit.
   *
   * @type {string}
   * @readonly
   */
  readonly cancel: string;

  /**
   * Property retry
   *
   * @description
   * Label for retrying a failed send.
   *
   * @type {string}
   * @readonly
   */
  readonly retry: string;

  /**
   * Property sendKeys
   *
   * @description
   * The keys of the send shortcut, shown next to Envoyer.
   *
   * @type {readonly string[]}
   * @readonly
   */
  readonly sendKeys: readonly string[];
  // #endregion
}
