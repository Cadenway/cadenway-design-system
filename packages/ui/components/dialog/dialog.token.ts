import { InjectionToken, type Signal } from '@angular/core';

import type { CwDialogCloseReason } from './dialog.types';

/**
 * Interface CwDialogContext
 *
 * @description
 * What the parts of a dialog (header, title, description, footer, close button) read from the
 * `cw-dialog` around them. The dialog provides itself under this token, so the parts find it
 * without importing its class (it queries them). Not exported from the entry point.
 */
export interface CwDialogContext {
  // #region Properties
  /**
   * Property scrollable
   * @readonly
   *
   * @description
   * Whether the dialog body scrolls.
   *
   * @type {Signal<boolean>}
   */
  readonly scrollable: Signal<boolean>;

  /**
   * Property showClose
   * @readonly
   *
   * @description
   * Whether the close button is visible.
   *
   * @type {Signal<boolean>}
   */
  readonly showClose: Signal<boolean>;

  /**
   * Property pending
   * @readonly
   *
   * @description
   * Whether a submission is pending.
   *
   * @type {Signal<boolean>}
   */
  readonly pending: Signal<boolean>;

  /**
   * Property titleId
   * @readonly
   *
   * @description
   * Identifier of the dialog title.
   *
   * @type {string}
   */
  readonly titleId: string;

  /**
   * Property descriptionId
   * @readonly
   *
   * @description
   * Identifier of the dialog description.
   *
   * @type {string}
   */
  readonly descriptionId: string;
  // #endregion

  // #region Methods
  /**
   * Method requestClose
   *
   * @description
   * Requests closure for the given reason.
   *
   * @param {CwDialogCloseReason} reason - User action requesting the dialog closure.
   */
  requestClose(reason: CwDialogCloseReason): void;
  // #endregion
}

/**
 * Constant CW_DIALOG
 *
 * @description
 * Injection token for the parent dialog context.
 *
 * @type {InjectionToken<CwDialogContext>}
 */
export const CW_DIALOG: InjectionToken<CwDialogContext> = new InjectionToken<CwDialogContext>(
  'CW_DIALOG',
);
