import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { ALERT_DIALOG_LABELS } from './alert-dialog-labels.token';
import { CW_ALERT_DIALOG_LABELS } from './alert-dialog.constants';
import type { CwAlertDialogLabels } from './alert-dialog.types';

/**
 * Function provideCwAlertDialogLabels
 *
 * @description
 * Replaces default texts below this injector, merging with parent labels. Individual text inputs
 * still override these values. A factory runs once in an injection context when labels are read.
 *
 * @param {Partial<CwAlertDialogLabels> | (() => Partial<CwAlertDialogLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of merged texts.
 */
export function provideCwAlertDialogLabels(
  labels: Partial<CwAlertDialogLabels> | (() => Partial<CwAlertDialogLabels>),
): Provider {
  return ɵprovideLabels(ALERT_DIALOG_LABELS, CW_ALERT_DIALOG_LABELS, labels);
}
