import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { RELATIONS_LABELS } from './relations-labels.token';
import { CW_RELATIONS_LABELS } from './relations.constants';
import type { CwRelationsLabels } from './relations.types';
/**
 * Function provideCwRelationsLabels
 *
 * @description
 * Sets texts below this injector, merged over parent texts and French defaults. The `labels`
 * input overrides these values. A factory runs once in an injection context when first read.
 *
 * @param {Partial<CwRelationsLabels> | (() => Partial<CwRelationsLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwRelationsLabels(
  labels: Partial<CwRelationsLabels> | (() => Partial<CwRelationsLabels>),
): Provider {
  return ɵprovideLabels(RELATIONS_LABELS, CW_RELATIONS_LABELS, labels);
}
