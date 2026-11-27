/**
 * Type CwDialogSize
 *
 * @description
 * Maximum width or full-screen layout of a dialog: `sm` 384 px, `default` 448 px, `md` 512 px (the
 * Space statuses, sharing and keyboard shortcuts dialogs, `max-w-lg` in the mockup `App.dc.html`),
 * `lg` 672 px, `xl` 896 px (the sprint report and custom fields dialogs, `max-w-4xl` in the same
 * mockup), `full` the screen less 16 px on each side, `screen` the whole viewport edge to edge on
 * the canvas surface, without border, radius, shadow or backdrop (the onboarding assistant, `fixed
 * inset-0 bg-canvas` in the mockup `App.dc.html`).
 *
 * @type {'sm' | 'default' | 'md' | 'lg' | 'xl' | 'full' | 'screen'}
 */
export type CwDialogSize = 'sm' | 'default' | 'md' | 'lg' | 'xl' | 'full' | 'screen';

/**
 * Type CwDialogCloseReason
 *
 * @description
 * Why a dialog closed, emitted by `closed` once the exit animation ends: Escape, a click on the
 * backdrop, the close button or a `button[cwDialogClose]`, or the consumer (`[(open)]`, `close()`).
 * A browser Back or Forward (unless `closeOnNavigation` or `DEFAULT_DIALOG_CONFIG` turns it off)
 * also emits `action`, but right away and without the exit animation, since the CDK has already
 * removed the window; `pending` does not hold it back.
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
