/** Maximum width of a dialog; `full` fills the screen with a 16 px margin. */
export type CwDialogSize = 'sm' | 'default' | 'lg' | 'full';

/**
 * Why a dialog closed, emitted by `closed` once the exit animation ends: Escape, a click on the
 * backdrop, the close button or a `button[cwDialogClose]`, or the consumer (`[(open)]`, `close()`).
 */
export type CwDialogCloseReason = 'escape' | 'overlay' | 'close' | 'action';
