import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { FILTER_BAR_LABELS } from './filter-bar-labels.token';
import { CW_FILTER_BAR_LABELS } from './filter-bar.constants';
import type { CwFilterBarLabels } from './filter-bar.types';
/**
 * Function provideCwFilterBarLabels
 *
 * @description
 * Sets texts below this injector, merged over parent texts and French defaults. The `labels`
 * input overrides these values. A factory runs once in an injection context when first read.
 *
 * @param {Partial<CwFilterBarLabels> | (() => Partial<CwFilterBarLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwFilterBarLabels(
  labels: Partial<CwFilterBarLabels> | (() => Partial<CwFilterBarLabels>),
): Provider {
  return ɵprovideLabels(FILTER_BAR_LABELS, CW_FILTER_BAR_LABELS, labels);
}
