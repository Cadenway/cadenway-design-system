import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { COMBOBOX_LABELS } from './combobox-labels.token';
import { CW_COMBOBOX_LABELS } from './combobox.constants';
import type { CwComboboxLabels } from './combobox.types';

/**
 * Function provideCwComboboxLabels
 *
 * @description
 * Replaces texts below this injector, merged over parent texts and French defaults. `placeholder`, `searchPlaceholder`, `emptyText`, `createLabel`, `loadingText`, `summary`, `resultsLabel` and `disabledLabel` inputs still override these texts.
 * A factory runs once in an injection context on first use.
 *
 * @param {Partial<CwComboboxLabels> | (() => Partial<CwComboboxLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwComboboxLabels(
  labels: Partial<CwComboboxLabels> | (() => Partial<CwComboboxLabels>),
): Provider {
  return ɵprovideLabels(COMBOBOX_LABELS, CW_COMBOBOX_LABELS, labels);
}
