import type { CwDialogLabels } from './dialog.types';

/**
 * Constant CW_DIALOG_LABELS
 *
 * @description
 * The default texts of a dialog, word for word from the Dialog sheet of the Design System artifact.
 * `provideCwDialogLabels` replaces them for every dialog below its injector; the `closeLabel`
 * input still overrides one dialog.
 *
 * @type {CwDialogLabels}
 */
export const CW_DIALOG_LABELS: CwDialogLabels = {
  close: 'Fermer',
};
