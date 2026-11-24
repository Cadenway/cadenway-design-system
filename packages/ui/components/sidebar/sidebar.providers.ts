import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { SIDEBAR_LABELS } from './sidebar-labels.token';
import { CW_SIDEBAR_LABELS } from './sidebar.constants';
import type { CwSidebarLabels } from './sidebar.types';

/**
 * Function provideCwSidebarLabels
 *
 * @description
 * Replaces texts below this injector, merging over parent and French defaults. Individual text
 * inputs still override them. A factory runs once in an injection context when first read.
 *
 * @param {Partial<CwSidebarLabels> | (() => Partial<CwSidebarLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwSidebarLabels(
  labels: Partial<CwSidebarLabels> | (() => Partial<CwSidebarLabels>),
): Provider {
  return ɵprovideLabels(SIDEBAR_LABELS, CW_SIDEBAR_LABELS, labels);
}
