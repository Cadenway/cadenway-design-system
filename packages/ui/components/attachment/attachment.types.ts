/**
 * Type CwAttachmentType
 *
 * @description
 * What an attachment is: an image, a PDF, another file, or a link; sets its media and main action.
 *
 * @type {'image' | 'pdf' | 'file' | 'link'}
 */
export type CwAttachmentType = 'image' | 'pdf' | 'file' | 'link';

/**
 * Type CwAttachmentState
 *
 * @description
 * Upload state of an attachment, mirrored on `data-state`.
 *
 * @type {'done' | 'uploading' | 'processing' | 'error'}
 */
export type CwAttachmentState = 'done' | 'uploading' | 'processing' | 'error';

/**
 * Type CwAttachmentSize
 *
 * @description
 * A card (`default`, 58 px) or a compact chip (`sm`, 28 px, composer and form fields).
 *
 * @type {'default' | 'sm'}
 */
export type CwAttachmentSize = 'default' | 'sm';

/**
 * Type CwAttachmentOrientation
 *
 * @description
 * A horizontal card or chip, or a `vertical` thumbnail (144 px wide, 4:3 preview).
 *
 * @type {'horizontal' | 'vertical'}
 */
export type CwAttachmentOrientation = 'horizontal' | 'vertical';

/**
 * Interface CwAttachmentLabels
 *
 * @description
 * The French texts of an attachment; each one can be replaced through the `labels` input.
 */
export interface CwAttachmentLabels {
  // #region Properties
  /**
   * Property image
   * @readonly
   *
   * @description
   * Type word of an image on the second line (« 312 Ko · Image »).
   *
   * @type {string}
   */
  readonly image: string;

  /**
   * Property file
   * @readonly
   *
   * @description
   * Type word of a file without extension.
   *
   * @type {string}
   */
  readonly file: string;

  /**
   * Property download
   * @readonly
   *
   * @description
   * Accessible name of the download action, before the name.
   *
   * @type {string}
   */
  readonly download: string;

  /**
   * Property open
   * @readonly
   *
   * @description
   * Accessible name of the open action of a link, before the name.
   *
   * @type {string}
   */
  readonly open: string;

  /**
   * Property retry
   * @readonly
   *
   * @description
   * Accessible name of the retry action, before the name.
   *
   * @type {string}
   */
  readonly retry: string;

  /**
   * Property cancel
   * @readonly
   *
   * @description
   * Accessible name of the cancel action, before the name.
   *
   * @type {string}
   */
  readonly cancel: string;

  /**
   * Property progress
   * @readonly
   *
   * @description
   * Accessible name of the progress bar, before the name.
   *
   * @type {string}
   */
  readonly progress: string;

  /**
   * Property processing
   * @readonly
   *
   * @description
   * Second line while the preview is generated.
   *
   * @type {string}
   */
  readonly processing: string;

  /**
   * Property processingShort
   * @readonly
   *
   * @description
   * Shorter second line while processing, on a compact chip.
   *
   * @type {string}
   */
  readonly processingShort: string;

  /**
   * Property uploading
   * @readonly
   *
   * @description
   * Second line of a thumbnail while uploading, before the percentage.
   *
   * @type {string}
   */
  readonly uploading: string;

  /**
   * Property failed
   * @readonly
   *
   * @description
   * Second line of a failed compact chip.
   *
   * @type {string}
   */
  readonly failed: string;

  /**
   * Property sending
   * @readonly
   *
   * @description
   * Accessible name of the spinner while uploading.
   *
   * @type {string}
   */
  readonly sending: string;

  /**
   * Property working
   * @readonly
   *
   * @description
   * Accessible name of the spinner while processing.
   *
   * @type {string}
   */
  readonly working: string;

  /**
   * Property done
   * @readonly
   *
   * @description
   * Announced when the upload ends, after the name.
   *
   * @type {string}
   */
  readonly done: string;
  // #endregion
}
