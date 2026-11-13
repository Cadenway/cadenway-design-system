import { InjectionToken, type Signal } from '@angular/core';

import type { CwDialogCloseReason } from './dialog.types';

/**
 * What the parts of a dialog (header, title, description, footer, close button) read from the
 * `cw-dialog` around them. The dialog provides itself under this token, so the parts find it
 * without importing its class (it queries them). Not exported from the entry point.
 */
export interface CwDialogContext {
  readonly scrollable: Signal<boolean>;
  readonly showClose: Signal<boolean>;
  readonly pending: Signal<boolean>;
  readonly titleId: string;
  readonly descriptionId: string;
  requestClose(reason: CwDialogCloseReason): void;
}

/** The `cw-dialog` around a part; absent when a part is rendered on its own (static stories). */
export const CW_DIALOG = new InjectionToken<CwDialogContext>('CW_DIALOG');
