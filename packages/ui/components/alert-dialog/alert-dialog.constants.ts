import type { CwAlertDialogLabels } from './alert-dialog.types';

/**
 * Constant CW_ALERT_DIALOG_MAX_ITEMS
 *
 * @description
 * How many items of `items` an alert dialog lists before « + n autres » (mockup `App.dc.html`,
 * confirmation before deletion).
 *
 * @type {number}
 */
export const CW_ALERT_DIALOG_MAX_ITEMS: number = 8;

/**
 * Constant CW_ALERT_DIALOG_LABELS
 *
 * @description
 * Default texts from the AlertDialog sheet of the Design System artifact.
 *
 * @type {CwAlertDialogLabels}
 */
export const CW_ALERT_DIALOG_LABELS: CwAlertDialogLabels = {
  confirm: 'Pour confirmer, saisissez',
  more: (count) => `+ ${String(count)} autres`,
};
