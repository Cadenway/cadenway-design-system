import { InjectionToken, type Signal } from '@angular/core';

import type {
  CwAlertDialogCancelReason,
  CwAlertDialogSize,
  CwAlertDialogVariant,
} from './alert-dialog.types';

/**
 * What the parts of an alert dialog (media, title, description, cancel and action buttons) read
 * from the `cw-alert-dialog` around them. The dialog provides itself under this token, so the
 * parts find it without importing its class. Not exported from the entry point.
 */
export interface CwAlertDialogContext {
  readonly size: Signal<CwAlertDialogSize>;
  readonly variant: Signal<CwAlertDialogVariant>;
  readonly pending: Signal<boolean>;
  /** The typed text matches `confirmText` (always true without one). */
  readonly confirmed: Signal<boolean>;
  readonly titleId: string;
  readonly descriptionId: string;
  requestCancel(reason: CwAlertDialogCancelReason): void;
  requestConfirm(): void;
}

/** The `cw-alert-dialog` around a part; absent when a part is rendered on its own (static stories). */
export const CW_ALERT_DIALOG = new InjectionToken<CwAlertDialogContext>('CW_ALERT_DIALOG');
