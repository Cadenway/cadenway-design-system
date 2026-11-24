import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { getProvidedLabels } from './calendar-view.constants';
import type { CwCalendarViewProvidedLabels } from './calendar-view.types';

/**
 * Constant CALENDAR_VIEW_LABELS
 *
 * @description
 * Texts provided to this entry, falling back to the French defaults.
 *
 * @type {InjectionToken<CwCalendarViewProvidedLabels>}
 */
export const CALENDAR_VIEW_LABELS: InjectionToken<CwCalendarViewProvidedLabels> =
  ɵlabelsToken<CwCalendarViewProvidedLabels>('CALENDAR_VIEW_LABELS', getProvidedLabels());
