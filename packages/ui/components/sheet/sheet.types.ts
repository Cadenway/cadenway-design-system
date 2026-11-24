/**
 * Type CwSheetSide
 *
 * @description
 * Edge of the screen the sheet is docked to (Sheet sheet of the Design System artifact): `right`
 * for a task detail, `left` for the phone navigation, `top` for a search band, `bottom` for a bulk
 * selection on a large screen.
 *
 * @type {'right' | 'left' | 'top' | 'bottom'}
 */
export type CwSheetSide = 'right' | 'left' | 'top' | 'bottom';

/**
 * Type CwSheetSize
 *
 * @description
 * Width of a `left` or `right` sheet (320, 400 and 560 px, or the whole screen); `full` also covers
 * the screen for a `top` or `bottom` sheet, whose height otherwise follows its content.
 *
 * @type {'sm' | 'default' | 'lg' | 'full'}
 */
export type CwSheetSize = 'sm' | 'default' | 'lg' | 'full';

/**
 * Type CwSheetCloseReason
 *
 * @description
 * Why a sheet closed, emitted by `closed` once the exit animation ends: Escape, a click on the
 * backdrop, the close button or a `button[cwSheetClose]`, or the consumer (`[(open)]`, `close()`).
 *
 * @type {'escape' | 'overlay' | 'close' | 'action'}
 */
export type CwSheetCloseReason = 'escape' | 'overlay' | 'close' | 'action';
