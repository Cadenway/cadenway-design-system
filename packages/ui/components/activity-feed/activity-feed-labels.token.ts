import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_ACTIVITY_FEED_LABELS } from './activity-feed.constants';
import type { CwActivityFeedLabels } from './activity-feed.types';

/**
 * Constant ACTIVITY_FEED_LABELS
 *
 * @description
 * Texts of every activity feed below the injector, merged over `CW_ACTIVITY_FEED_LABELS`.
 *
 * @type {InjectionToken<CwActivityFeedLabels>}
 */
export const ACTIVITY_FEED_LABELS: InjectionToken<CwActivityFeedLabels> =
  ɵlabelsToken<CwActivityFeedLabels>('ACTIVITY_FEED_LABELS', CW_ACTIVITY_FEED_LABELS);
