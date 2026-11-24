import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';
import { CW_TIME_TRACKER_LABELS } from './time-tracker.constants';
import type { CwTimeTrackerLabels } from './time-tracker.types';
/**
 * Constant TIME_TRACKER_LABELS
 *
 * @description
 * Texts provided below the injector, falling back to the French defaults.
 *
 * @type {InjectionToken<CwTimeTrackerLabels>}
 */
export const TIME_TRACKER_LABELS: InjectionToken<CwTimeTrackerLabels> =
  ɵlabelsToken<CwTimeTrackerLabels>('TIME_TRACKER_LABELS', CW_TIME_TRACKER_LABELS);
