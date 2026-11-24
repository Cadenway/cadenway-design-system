import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { CHECKLIST_LABELS } from './checklist-labels.token';
import { getProvidedLabels } from './checklist.constants';
import type { CwChecklistProvidedLabels } from './checklist.types';

/**
 * Function provideCwChecklistLabels
 *
 * @description
 * Supplies texts for this entry below the injector, merged over parent values and French defaults.
 * Individual inputs still override the provided values. A factory runs once in an injection context.
 *
 * @param {Partial<CwChecklistProvidedLabels> | (() => Partial<CwChecklistProvidedLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwChecklistLabels(
  labels: Partial<CwChecklistProvidedLabels> | (() => Partial<CwChecklistProvidedLabels>),
): Provider {
  return ɵprovideLabels(CHECKLIST_LABELS, getProvidedLabels(), labels);
}
