import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { SPINNER_LABELS } from './spinner-labels.token';
import { CW_SPINNER_LABELS } from './spinner.constants';
import type { CwSpinnerLabels } from './spinner.types';

/**
 * Function provideCwSpinnerLabels
 *
 * @description
 * Sets texts for the injector subtree, merged over parent and French defaults. Explicit text
 * inputs override the provided values. A factory runs once in an injection context.
 *
 * @param {Partial<CwSpinnerLabels> | (() => Partial<CwSpinnerLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwSpinnerLabels(
  labels: Partial<CwSpinnerLabels> | (() => Partial<CwSpinnerLabels>),
): Provider {
  return ɵprovideLabels(SPINNER_LABELS, CW_SPINNER_LABELS, labels);
}
