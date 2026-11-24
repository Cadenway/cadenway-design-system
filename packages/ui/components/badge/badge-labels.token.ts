import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_BADGE_LABELS } from './badge.constants';
import type { CwBadgeLabels } from './badge.types';

/**
 * Constant BADGE_LABELS
 *
 * @description
 * Texts of every badge below the injector: the ones given by `provideCwBadgeLabels`, over the
 * French defaults (`CW_BADGE_LABELS`) when nothing is provided.
 *
 * @type {InjectionToken<CwBadgeLabels>}
 */
export const BADGE_LABELS: InjectionToken<CwBadgeLabels> = ɵlabelsToken<CwBadgeLabels>(
  'BADGE_LABELS',
  CW_BADGE_LABELS,
);
