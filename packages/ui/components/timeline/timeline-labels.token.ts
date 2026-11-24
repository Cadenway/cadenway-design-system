import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';
import { CW_TIMELINE_LABELS } from './timeline.constants';
import type { CwTimelineLabels } from './timeline.types';

/**
 * Constant TIMELINE_LABELS
 *
 * @description
 * Timeline texts inherited from the injector or French defaults.
 *
 * @type {InjectionToken<CwTimelineLabels>}
 */
export const TIMELINE_LABELS: InjectionToken<CwTimelineLabels> = ɵlabelsToken<CwTimelineLabels>(
  'TIMELINE_LABELS',
  CW_TIMELINE_LABELS,
);
