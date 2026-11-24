import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { CALENDAR_VIEW_LABELS } from './calendar-view-labels.token';
import { getProvidedLabels } from './calendar-view.constants';
import type { CwCalendarViewProvidedLabels } from './calendar-view.types';

/**
 * Function provideCwCalendarViewLabels
 *
 * @description
 * Supplies texts for this entry below the injector, merged over parent values and French defaults.
 * Individual inputs still override the provided values. A factory runs once in an injection context.
 *
 * @param {Partial<CwCalendarViewProvidedLabels> | (() => Partial<CwCalendarViewProvidedLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwCalendarViewLabels(
  labels: Partial<CwCalendarViewProvidedLabels> | (() => Partial<CwCalendarViewProvidedLabels>),
): Provider {
  return ɵprovideLabels(CALENDAR_VIEW_LABELS, getProvidedLabels(), labels);
}
