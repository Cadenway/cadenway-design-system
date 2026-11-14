import { InjectionToken, type Signal } from '@angular/core';

import type {
  CwAlertDialogCancelReason,
  CwAlertDialogSize,
  CwAlertDialogVariant,
} from './alert-dialog.types';

/**
 * Interface CwAlertDialogContext
 *
 * @description
 * What the parts of an alert dialog (media, title, description, cancel and action buttons) read
 * from the `cw-alert-dialog` around them. The dialog provides itself under this token, so the
 * parts find it without importing its class. Not exported from the entry point.
 */
export interface CwAlertDialogContext {
  // #region Properties
  /**
   * Property size
   * @readonly
   *
   * @description
   * Dialog size and layout.
   *
   * @type {Signal<CwAlertDialogSize>}
   */
  readonly size: Signal<CwAlertDialogSize>;

  /**
   * Property variant
   * @readonly
   *
   * @description
   * Action and media style.
   *
   * @type {Signal<CwAlertDialogVariant>}
   */
  readonly variant: Signal<CwAlertDialogVariant>;

  /**
   * Property pending
   * @readonly
   *
   * @description
   * Whether the action is running.
   *
   * @type {Signal<boolean>}
   */
  readonly pending: Signal<boolean>;

  /**
   * Property confirmed
   * @readonly
   *
   * @description
   * Whether the typed confirmation matches.
   *
   * @type {Signal<boolean>}
   */
  readonly confirmed: Signal<boolean>;

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
   * Method requestCancel
   *
   * @description
   * Requests cancellation for the given reason.
   *
   * @param {CwAlertDialogCancelReason} reason - User action requesting cancellation.
   */
  requestCancel(reason: CwAlertDialogCancelReason): void;

  /**
   * Method requestConfirm
   *
   * @description
   * Requests confirmation of the action.
   */
  requestConfirm(): void;
  // #endregion
}

/**
 * Constant CW_ALERT_DIALOG
 *
 * @description
 * Injection token for the parent alert dialog context.
 *
 * @type {InjectionToken<CwAlertDialogContext>}
 */
export const CW_ALERT_DIALOG: InjectionToken<CwAlertDialogContext> =
  new InjectionToken<CwAlertDialogContext>('CW_ALERT_DIALOG');
