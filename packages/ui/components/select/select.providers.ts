import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { SELECT_LABELS } from './select-labels.token';
import { CW_SELECT_LABELS } from './select.constants';
import type { CwSelectLabels } from './select.types';

/**
 * Function provideCwSelectLabels
 *
 * @description
 * Replaces texts below this injector, merging over parent and French defaults. Individual text
 * inputs still override them. A factory runs once in an injection context when first read.
 *
 * @param {Partial<CwSelectLabels> | (() => Partial<CwSelectLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwSelectLabels(
  labels: Partial<CwSelectLabels> | (() => Partial<CwSelectLabels>),
): Provider {
  return ɵprovideLabels(SELECT_LABELS, CW_SELECT_LABELS, labels);
}
