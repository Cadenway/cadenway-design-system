import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';
import { CW_TIME_ENTRY_FORM_LABELS } from './time-tracker.constants';
import type { CwTimeEntryFormLabels } from './time-tracker.types';
/**
 * Constant TIME_ENTRY_FORM_LABELS
 *
 * @description
 * Texts provided below the injector, falling back to the French defaults.
 *
 * @type {InjectionToken<CwTimeEntryFormLabels>}
 */
export const TIME_ENTRY_FORM_LABELS: InjectionToken<CwTimeEntryFormLabels> =
  ɵlabelsToken<CwTimeEntryFormLabels>('TIME_ENTRY_FORM_LABELS', CW_TIME_ENTRY_FORM_LABELS);
