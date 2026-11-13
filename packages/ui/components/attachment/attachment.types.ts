/** What an attachment is: an image, a PDF, another file, or a link; sets its media and main action. */
export type CwAttachmentType = 'image' | 'pdf' | 'file' | 'link';

/** Upload state of an attachment, mirrored on `data-state`. */
export type CwAttachmentState = 'done' | 'uploading' | 'processing' | 'error';

/** A card (`default`, 58 px) or a compact chip (`sm`, 28 px, composer and form fields). */
export type CwAttachmentSize = 'default' | 'sm';

/** A horizontal card or chip, or a `vertical` thumbnail (144 px wide, 4:3 preview). */
export type CwAttachmentOrientation = 'horizontal' | 'vertical';

/** The French texts of an attachment; each one can be replaced through the `labels` input. */
export interface CwAttachmentLabels {
  /** Type word of an image on the second line (« 312 Ko · Image »). */
  readonly image: string;
  /** Type word of a file without extension. */
  readonly file: string;
  /** Accessible name of the download action, before the name. */
  readonly download: string;
  /** Accessible name of the open action of a link, before the name. */
  readonly open: string;
  /** Accessible name of the retry action, before the name. */
  readonly retry: string;
  /** Accessible name of the cancel action, before the name. */
  readonly cancel: string;
  /** Accessible name of the progress bar, before the name. */
  readonly progress: string;
  /** Second line while the preview is generated. */
  readonly processing: string;
  /** Shorter second line while processing, on a compact chip. */
  readonly processingShort: string;
  /** Second line of a thumbnail while uploading, before the percentage. */
  readonly uploading: string;
  /** Second line of a failed compact chip. */
  readonly failed: string;
  /** Accessible name of the spinner while uploading. */
  readonly sending: string;
  /** Accessible name of the spinner while processing. */
  readonly working: string;
  /** Announced when the upload ends, after the name. */
  readonly done: string;
}
