/** Layout of a drop zone: a centered block (`default`) or a 48 px line (`compact`, composer). */
export type CwDropzoneSize = 'default' | 'compact';

/** Drag state of a drop zone, mirrored on `data-state`: at rest, files over it, refused files over it. */
export type CwDropzoneState = 'idle' | 'over' | 'reject';

/** Why the local check refused a file: its type, its size, or the number of files. */
export type CwDropzoneRejectReason = 'type' | 'size' | 'count';

/** A file the local check refused, with the reason to show next to its name. */
export interface CwDropzoneRejection {
  /** The refused file, as the browser gave it. */
  readonly file: File;
  /** The first rule it broke, checked in the order type, size, count. */
  readonly reason: CwDropzoneRejectReason;
}

/** The French texts of a drop zone; each one can be replaced through the `labels` input. */
export interface CwDropzoneLabels {
  /** Joins the title and the browse button (« Déposez des fichiers ou parcourez »). */
  readonly or: string;
  /** Words after the browse button's text in its accessible name, before the limits in parentheses. */
  readonly browseAria: string;
  /** Title while accepted files are dragged over the zone. */
  readonly drop: string;
  /** Title while a refused type is dragged over the zone. */
  readonly reject: string;
  /** Start of the text shown when `maxFiles` is reached (« Limite atteinte : 10 fichiers »). */
  readonly limit: string;
  /** Unit after a count of one. */
  readonly file: string;
  /** Unit after any other count. */
  readonly files: string;
}

/** Upload state of a file row: waiting in the queue, sending, sent, or failed. */
export type CwDropzoneFileState = 'queued' | 'uploading' | 'done' | 'error';

/** The French texts of a file row; each one can be replaced through the `labels` input. */
export interface CwDropzoneFileLabels {
  /** Meta text of a queued file. */
  readonly queued: string;
  /** Joins the sent and total sizes (« 312 Ko sur 488 Ko »). */
  readonly of: string;
  /** Accessible name of the progress bar, before the file name. */
  readonly progress: string;
  /** Accessible name of the spinner while the file is sent. */
  readonly sending: string;
  /** Accessible name of the cancel button, before the file name. */
  readonly cancel: string;
  /** Accessible name of the retry button, before the file name. */
  readonly retry: string;
  /** Accessible name of the remove button, before the file name. */
  readonly remove: string;
  /** Announced when the upload ends, after the file name. */
  readonly done: string;
}
