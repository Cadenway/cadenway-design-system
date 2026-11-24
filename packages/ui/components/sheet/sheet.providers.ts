import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { SHEET_LABELS } from './sheet-labels.token';
import { CW_SHEET_LABELS } from './sheet.constants';
import type { CwSheetLabels } from './sheet.types';

/**
 * Function provideCwSheetLabels
 *
 * @description
 * Sets the texts of every `cw-sheet` below the injector it is provided in (the application, a
 * route or a component subtree), for example the English source copy of an application translated
 * with `$localize`. The texts are merged over those of the parent injector, then over the French
 * defaults (`CW_SHEET_LABELS`); a sheet's `closeLabel` input still overrides them. A function is
 * called once, in an injection context, when a sheet first reads its texts.
 *
 * @param {Partial<CwSheetLabels> | (() => Partial<CwSheetLabels>)} labels - Texts to replace, or a
 * function returning them.
 *
 * @returns {Provider} Provider of the merged sheet texts.
 */
export function provideCwSheetLabels(
  labels: Partial<CwSheetLabels> | (() => Partial<CwSheetLabels>),
): Provider {
  return ɵprovideLabels(SHEET_LABELS, CW_SHEET_LABELS, labels);
}
