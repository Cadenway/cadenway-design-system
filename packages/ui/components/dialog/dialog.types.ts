/**
 * Type CwDialogSize
 *
 * @description
 * Maximum width or full-screen layout of a dialog: `sm` 384 px, `default` 448 px, `md` 512 px (the
 * Space statuses, sharing and keyboard shortcuts dialogs, `max-w-lg` in the mockup `App.dc.html`),
 * `lg` 672 px, `xl` 896 px (the sprint report, custom fields and task creation dialogs,
 * `max-w-4xl` in the same mockup), `2xl` 1024 px, `tall` 1024 px wide and 88 % of the viewport
 * high, 6 % from its top and bottom (the task detail sheet, `top-[6vh] h-[88vh] max-w-5xl`), `full`
 * the screen less 16 px on each side, `screen` the whole viewport edge to edge on the canvas
 * surface, without border, radius, shadow or backdrop (the onboarding assistant, `fixed inset-0
 * bg-canvas` in the mockup `App.dc.html`).
 *
 * @type {'sm' | 'default' | 'md' | 'lg' | 'xl' | '2xl' | 'tall' | 'full' | 'screen'}
 */
export type CwDialogSize =
  | 'sm'
  | 'default'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | 'tall'
  | 'full'
  | 'screen';

/**
 * Type CwDialogPlacement
 *
 * @description
 * Where a window sits from 768 px: `center` (default) centers it in the viewport; `top` pins its
 * top edge 8 % below the top of the viewport, so it grows downwards when its content changes (the
 * task creation dialog, `top-[8vh]` in the mockup `App.dc.html`). Below 768 px every window fills
 * the screen.
 *
 * @type {'center' | 'top'}
 */
export type CwDialogPlacement = 'center' | 'top';

/**
 * Type CwDialogPadding
 *
 * @description
 * Inner spacing of the body: `default` pads it (24 px, 12 px above and below in a `scrollable`
 * dialog); `none` leaves it to the content, which draws its own sections edge to edge (the task
 * detail sheet of the mockup `App.dc.html`).
 *
 * @type {'default' | 'none'}
 */
export type CwDialogPadding = 'default' | 'none';

/**
 * Type CwDialogHeaderVariant
 *
 * @description
 * Look of a `cw-dialog-header`: `default` stacks the title and the description; `bar` is a 12 px
 * high-padded row over a rule, the title at 16 px, its items wrapping (the task creation and task
 * detail headers, `border-b px-4 py-3` in the mockup `App.dc.html`). Use `bar` in a `scrollable`
 * dialog or one with `padding="none"`, whose header spans the window.
 *
 * @type {'default' | 'bar'}
 */
export type CwDialogHeaderVariant = 'default' | 'bar';

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
