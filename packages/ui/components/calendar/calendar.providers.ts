import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { CALENDAR_LABELS } from './calendar-labels.token';
import { CW_CALENDAR_LABELS } from './calendar.constants';
import type { CwCalendarLabels } from './calendar.types';

/**
 * Function provideCwCalendarLabels
 *
 * @description
 * Replaces default texts below this injector, merging with parent labels. Individual text inputs
 * still override these values. A factory runs once in an injection context when labels are read.
 *
 * @param {Partial<CwCalendarLabels> | (() => Partial<CwCalendarLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of merged texts.
 */
export function provideCwCalendarLabels(
  labels: Partial<CwCalendarLabels> | (() => Partial<CwCalendarLabels>),
): Provider {
  return ɵprovideLabels(CALENDAR_LABELS, CW_CALENDAR_LABELS, labels);
}
