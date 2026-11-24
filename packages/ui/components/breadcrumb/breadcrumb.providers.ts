import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { BREADCRUMB_LABELS } from './breadcrumb-labels.token';
import { CW_BREADCRUMB_LABELS } from './breadcrumb.constants';
import type { CwBreadcrumbLabels } from './breadcrumb.types';

/**
 * Function provideCwBreadcrumbLabels
 *
 * @description
 * Replaces default texts below this injector, merging with parent labels. Individual text inputs
 * still override these values. A factory runs once in an injection context when labels are read.
 *
 * @param {Partial<CwBreadcrumbLabels> | (() => Partial<CwBreadcrumbLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of merged texts.
 */
export function provideCwBreadcrumbLabels(
  labels: Partial<CwBreadcrumbLabels> | (() => Partial<CwBreadcrumbLabels>),
): Provider {
  return ɵprovideLabels(BREADCRUMB_LABELS, CW_BREADCRUMB_LABELS, labels);
}
