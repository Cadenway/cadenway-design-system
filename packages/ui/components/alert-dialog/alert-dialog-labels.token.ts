import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_ALERT_DIALOG_LABELS } from './alert-dialog.constants';
import type { CwAlertDialogLabels } from './alert-dialog.types';

/**
 * Constant ALERT_DIALOG_LABELS
 *
 * @description
 * Injector-scoped texts with French defaults.
 *
 * @type {InjectionToken<CwAlertDialogLabels>}
 */
export const ALERT_DIALOG_LABELS: InjectionToken<CwAlertDialogLabels> =
  ɵlabelsToken<CwAlertDialogLabels>('ALERT_DIALOG_LABELS', CW_ALERT_DIALOG_LABELS);
