import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_CALENDAR_LABELS } from './calendar.constants';
import type { CwCalendarLabels } from './calendar.types';

/**
 * Constant CALENDAR_LABELS
 *
 * @description
 * Injector-scoped texts with French defaults.
 *
 * @type {InjectionToken<CwCalendarLabels>}
 */
export const CALENDAR_LABELS: InjectionToken<CwCalendarLabels> = ɵlabelsToken<CwCalendarLabels>(
  'CALENDAR_LABELS',
  CW_CALENDAR_LABELS,
);
