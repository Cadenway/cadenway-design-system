/**
 * Type CwDropzoneSize
 *
 * @description
 * Layout of a drop zone: a centered block (`default`) or a 48 px line (`compact`, composer).
 *
 * @type {'default' | 'compact'}
 */
export type CwDropzoneSize = 'default' | 'compact';

/**
 * Type CwDropzoneState
 *
 * @description
 * Drag state of a drop zone, mirrored on `data-state`: at rest, files over it, refused files over it.
 *
 * @type {'idle' | 'over' | 'reject'}
 */
export type CwDropzoneState = 'idle' | 'over' | 'reject';

/**
 * Type CwDropzoneRejectReason
 *
 * @description
 * Why the local check refused a file: its type, its size, or the number of files.
 *
 * @type {'type' | 'size' | 'count'}
 */
export type CwDropzoneRejectReason = 'type' | 'size' | 'count';

/**
 * Interface CwDropzoneRejection
 *
 * @description
 * A file the local check refused, with the reason to show next to its name.
 */
export interface CwDropzoneRejection {
  // #region Properties
  /**
   * Property file
   * @readonly
   *
   * @description
   * The refused file, as the browser gave it.
   *
   * @type {File}
   */
  readonly file: File;

  /**
   * Property reason
   * @readonly
   *
   * @description
   * The first rule it broke, checked in the order type, size, count.
   *
   * @type {CwDropzoneRejectReason}
   */
  readonly reason: CwDropzoneRejectReason;
  // #endregion
}

/**
 * Interface CwDropzoneLabels
 *
 * @description
 * The French texts of a drop zone; each one can be replaced through the `labels` input.
 */
export interface CwDropzoneLabels {
  // #region Properties
  /**
   * Property or
   * @readonly
   *
   * @description
   * Joins the title and the browse button (« Déposez des fichiers ou parcourez »).
   *
   * @type {string}
   */
  readonly or: string;

  /**
   * Property browseAria
   * @readonly
   *
   * @description
   * Words after the browse button's text in its accessible name, before the limits in parentheses.
   *
   * @type {string}
   */
  readonly browseAria: string;

  /**
   * Property drop
   * @readonly
   *
   * @description
   * Title while accepted files are dragged over the zone.
   *
   * @type {string}
   */
  readonly drop: string;

  /**
   * Property reject
   * @readonly
   *
   * @description
   * Title while a refused type is dragged over the zone.
   *
   * @type {string}
   */
  readonly reject: string;

  /**
   * Property limit
   * @readonly
   *
   * @description
   * Start of the text shown when `maxFiles` is reached (« Limite atteinte : 10 fichiers »).
   *
   * @type {string}
   */
  readonly limit: string;

  /**
   * Property file
   * @readonly
   *
   * @description
   * Unit after a count of one.
   *
   * @type {string}
   */
  readonly file: string;

  /**
   * Property files
   * @readonly
   *
   * @description
   * Unit after any other count.
   *
   * @type {string}
   */
  readonly files: string;
  // #endregion
}

/**
 * Type CwDropzoneFileState
 *
 * @description
 * Upload state of a file row: waiting in the queue, sending, sent, or failed.
 *
 * @type {'queued' | 'uploading' | 'done' | 'error'}
 */
export type CwDropzoneFileState = 'queued' | 'uploading' | 'done' | 'error';

/**
 * Interface CwDropzoneFileLabels
 *
 * @description
 * The French texts of a file row; each one can be replaced through the `labels` input.
 */
export interface CwDropzoneFileLabels {
  // #region Properties
  /**
   * Property queued
   * @readonly
   *
   * @description
   * Meta text of a queued file.
   *
   * @type {string}
   */
  readonly queued: string;

  /**
   * Property of
   * @readonly
   *
   * @description
   * Joins the sent and total sizes (« 312 Ko sur 488 Ko »).
   *
   * @type {string}
   */
  readonly of: string;

  /**
   * Property progress
   * @readonly
   *
   * @description
   * Accessible name of the progress bar, before the file name.
   *
   * @type {string}
   */
  readonly progress: string;

  /**
   * Property sending
   * @readonly
   *
   * @description
   * Accessible name of the spinner while the file is sent.
   *
   * @type {string}
   */
  readonly sending: string;

  /**
   * Property cancel
   * @readonly
   *
   * @description
   * Accessible name of the cancel button, before the file name.
   *
   * @type {string}
   */
  readonly cancel: string;

  /**
   * Property retry
   * @readonly
   *
   * @description
   * Accessible name of the retry button, before the file name.
   *
   * @type {string}
   */
  readonly retry: string;

  /**
   * Property remove
   * @readonly
   *
   * @description
   * Accessible name of the remove button, before the file name.
   *
   * @type {string}
   */
  readonly remove: string;

  /**
   * Property done
   * @readonly
   *
   * @description
   * Announced when the upload ends, after the file name.
   *
   * @type {string}
   */
  readonly done: string;
  // #endregion
}
