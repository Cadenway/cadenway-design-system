import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { PROPERTY_LIST_LABELS } from './property-list-labels.token';
import { CW_PROPERTY_LIST_LABELS } from './property-list.constants';
import type { CwPropertyListLabels } from './property-list.types';

/**
 * Function provideCwPropertyListLabels
 *
 * @description
 * Replaces texts below this injector, merging over parent and French defaults. Individual text
 * inputs still override them. A factory runs once in an injection context when first read.
 *
 * @param {Partial<CwPropertyListLabels> | (() => Partial<CwPropertyListLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwPropertyListLabels(
  labels: Partial<CwPropertyListLabels> | (() => Partial<CwPropertyListLabels>),
): Provider {
  return ɵprovideLabels(PROPERTY_LIST_LABELS, CW_PROPERTY_LIST_LABELS, labels);
}
