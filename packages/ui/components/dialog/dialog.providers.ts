import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { DIALOG_LABELS } from './dialog-labels.token';
import { CW_DIALOG_LABELS } from './dialog.constants';
import type { CwDialogLabels } from './dialog.types';

/**
 * Function provideCwDialogLabels
 *
 * @description
 * Sets the texts of every `cw-dialog` below the injector it is provided in (the application, a
 * route or a component subtree), for example the English source copy of an application translated
 * with `$localize`. The texts are merged over those of the parent injector, then over the French
 * defaults (`CW_DIALOG_LABELS`); a dialog's `closeLabel` input still overrides them. A function is
 * called once, in an injection context, when a dialog first reads its texts.
 *
 * @param {Partial<CwDialogLabels> | (() => Partial<CwDialogLabels>)} labels - Texts to replace, or a
 * function returning them.
 *
 * @returns {Provider} Provider of the merged dialog texts.
 */
export function provideCwDialogLabels(
  labels: Partial<CwDialogLabels> | (() => Partial<CwDialogLabels>),
): Provider {
  return ɵprovideLabels(DIALOG_LABELS, CW_DIALOG_LABELS, labels);
}
