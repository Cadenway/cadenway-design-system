import type { CwAttachmentState } from '@cadenway/ui/components/attachment';
import type { CwBlockType, CwMentionPerson } from '@cadenway/ui/components/block-editor';

/** `full`: complete toolbar, Ctrl Entrée help, avatar; `compact`: one 36 px line that grows on focus. */
export type CwCommentComposerVariant = 'full' | 'compact';

/** `create` sends a new comment (Envoyer); `edit` saves an existing one (Annuler, Enregistrer). */
export type CwCommentComposerMode = 'create' | 'edit';

/** A person: the author shown on the left, or someone offered after « @ ». */
export type CwPerson = CwMentionPerson;

/** A block offered after « / » at the start of a line. */
export type CwComposerCommand = CwBlockType;

/** A file joined to the comment and the state of its upload, shown as a compact `cw-attachment`. */
export interface CwAttachmentDraft {
  /** Stable id, reported by `submit` and `attachmentRemove`. */
  readonly id: string;
  /** File name. */
  readonly name: string;
  /** MIME type, for the icon. */
  readonly mimeType?: string;
  /** Size in bytes. */
  readonly fileSize?: number | null;
  /** Upload state; the comment waits for `uploading` and `processing` to end. */
  readonly state: CwAttachmentState;
  /** Upload progress, 0 to 100. */
  readonly progress?: number;
  /** Address of the uploaded file. */
  readonly href?: string;
  /** Message of a failed upload. */
  readonly error?: string;
}

/** What `submit` carries: the Markdown, the mentioned people's ids, the uploaded files' ids. */
export interface CwCommentSubmit {
  readonly markdown: string;
  readonly mentions: readonly string[];
  readonly attachments: readonly string[];
}

/** French texts of the composer, all overridable through `labels`. */
export interface CwCommentComposerLabels {
  /** Name of the text area. */
  readonly editor: string;
  /** Name of the formatting toolbar. */
  readonly toolbar: string;
  /** The menu that holds the formatting buttons when the bar is narrow. */
  readonly formatting: string;
  readonly bold: string;
  readonly italic: string;
  readonly link: string;
  readonly bulletList: string;
  readonly code: string;
  /** The button that inserts « @ ». */
  readonly mention: string;
  /** The button that opens the file chooser. */
  readonly attach: string;
  readonly send: string;
  readonly save: string;
  readonly cancel: string;
  readonly retry: string;
  /** The keys of the send shortcut, shown next to Envoyer. */
  readonly sendKeys: readonly string[];
}
