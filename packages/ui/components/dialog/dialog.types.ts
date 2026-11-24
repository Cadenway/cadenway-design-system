/**
 * Type CwDialogSize
 *
 * @description
 * Maximum width or full-screen layout of a dialog.
 *
 * @type {'sm' | 'default' | 'lg' | 'full'}
 */
export type CwDialogSize = 'sm' | 'default' | 'lg' | 'full';

/**
 * Type CwDialogCloseReason
 *
 * @description
 * Why a dialog closed, emitted by `closed` once the exit animation ends: Escape, a click on the
 * backdrop, the close button or a `button[cwDialogClose]`, or the consumer (`[(open)]`, `close()`).
 *
 * @type {'escape' | 'overlay' | 'close' | 'action'}
 */
export type CwDialogCloseReason = 'escape' | 'overlay' | 'close' | 'action';

/**
 * Interface CwDialogLabels
 *
 * @description
 * The texts of a dialog, French by default (`CW_DIALOG_LABELS`), replaced for an application or a
 * subtree with `provideCwDialogLabels`.
 */
export interface CwDialogLabels {
  // #region Properties
  /**
   * Property close
   *
   * @description
   * Accessible name of the close button (`closeLabel`).
   *
   * @type {string}
   * @readonly
   */
  readonly close: string;
  // #endregion
}
