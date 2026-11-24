import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';
import { CW_TIME_ENTRY_LIST_LABELS } from './time-tracker.constants';
import type { CwTimeEntryListLabels } from './time-tracker.types';
/**
 * Constant TIME_ENTRY_LIST_LABELS
 *
 * @description
 * Texts provided below the injector, falling back to the French defaults.
 *
 * @type {InjectionToken<CwTimeEntryListLabels>}
 */
export const TIME_ENTRY_LIST_LABELS: InjectionToken<CwTimeEntryListLabels> =
  ɵlabelsToken<CwTimeEntryListLabels>('TIME_ENTRY_LIST_LABELS', CW_TIME_ENTRY_LIST_LABELS);
