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
