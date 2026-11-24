import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { AUTOCOMPLETE_LABELS } from './autocomplete-labels.token';
import { CW_AUTOCOMPLETE_LABELS } from './autocomplete.constants';
import type { CwAutocompleteLabels } from './autocomplete.types';

/**
 * Function provideCwAutocompleteLabels
 *
 * @description
 * Replaces default texts below this injector, merging with parent labels. Individual text inputs
 * still override these values. A factory runs once in an injection context when labels are read.
 *
 * @param {Partial<CwAutocompleteLabels> | (() => Partial<CwAutocompleteLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of merged texts.
 */
export function provideCwAutocompleteLabels(
  labels: Partial<CwAutocompleteLabels> | (() => Partial<CwAutocompleteLabels>),
): Provider {
  return ɵprovideLabels(AUTOCOMPLETE_LABELS, CW_AUTOCOMPLETE_LABELS, labels);
}
