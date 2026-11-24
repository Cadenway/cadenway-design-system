import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { ALERT_LABELS } from './alert-labels.token';
import { CW_ALERT_LABELS } from './alert.constants';
import type { CwAlertLabels } from './alert.types';

/**
 * Function provideCwAlertLabels
 *
 * @description
 * Replaces default texts below this injector, merging with parent labels. Individual text inputs
 * still override these values. A factory runs once in an injection context when labels are read.
 *
 * @param {Partial<CwAlertLabels> | (() => Partial<CwAlertLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of merged texts.
 */
export function provideCwAlertLabels(
  labels: Partial<CwAlertLabels> | (() => Partial<CwAlertLabels>),
): Provider {
  return ɵprovideLabels(ALERT_LABELS, CW_ALERT_LABELS, labels);
}
