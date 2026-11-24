/**
 * Type CwAlertDialogVariant
 *
 * @description
 * Style of the action and the media: `destructive` for a deletion, `default` for a heavy but reversible action.
 *
 * @type {'default' | 'destructive'}
 */
export type CwAlertDialogVariant = 'default' | 'destructive';

/**
 * Type CwAlertDialogSize
 *
 * @description
 * `sm`: 320 px, centered, with a media; `default`: 448 px, aligned to the start.
 *
 * @type {'sm' | 'default'}
 */
export type CwAlertDialogSize = 'sm' | 'default';

/**
 * Type CwAlertDialogCancelReason
 *
 * @description
 * How the confirmation was cancelled: the « Annuler » button or Escape.
 *
 * @type {'button' | 'escape'}
 */
export type CwAlertDialogCancelReason = 'button' | 'escape';

/**
 * Interface CwAlertDialogLabels
 *
 * @description
 * Texts used by AlertDialog instances.
 */
export interface CwAlertDialogLabels {
  // #region Properties
  /**
   * Property confirm
   *
   * @description
   * Prompt before the confirmation text.
   *
   * @type {string}
   */
  confirm: string;

  /**
   * Property more
   *
   * @description
   * Overflow item count.
   *
   * @type {(count: number) => string}
   */
  more: (count: number) => string;
  // #endregion
}
