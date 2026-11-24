import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_PRIORITY_LABELS } from './priority-icon.constants';
import type { CwPriorityLabels } from './priority-icon.types';

/**
 * Constant PRIORITY_LABELS
 *
 * @description
 * Priority words below the injector: the ones given by `provideCwPriorityLabels`, over the French
 * defaults (`CW_PRIORITY_LABELS`) when nothing is provided.
 *
 * @type {InjectionToken<CwPriorityLabels>}
 */
export const PRIORITY_LABELS: InjectionToken<CwPriorityLabels> = ɵlabelsToken<CwPriorityLabels>(
  'PRIORITY_LABELS',
  CW_PRIORITY_LABELS,
);
