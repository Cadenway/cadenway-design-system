import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_STAT_LABELS } from './stat.constants';
import type { CwStatLabels } from './stat.types';

/**
 * Constant STAT_LABELS
 *
 * @description
 * Texts of every stat below the injector: the ones given by `provideCwStatLabels`, over the
 * French defaults (`CW_STAT_LABELS`) when nothing is provided.
 *
 * @type {InjectionToken<CwStatLabels>}
 */
export const STAT_LABELS: InjectionToken<CwStatLabels> = ɵlabelsToken<CwStatLabels>(
  'STAT_LABELS',
  CW_STAT_LABELS,
);
