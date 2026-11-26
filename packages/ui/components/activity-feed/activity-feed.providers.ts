import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { ACTIVITY_FEED_LABELS } from './activity-feed-labels.token';
import { CW_ACTIVITY_FEED_LABELS } from './activity-feed.constants';
import type { CwActivityFeedLabels } from './activity-feed.types';

/**
 * Function provideCwActivityFeedLabels
 *
 * @description
 * Replaces the texts of every `cw-activity-feed` below this injector (the application, a route, a component subtree), merged over the parent's texts and the French defaults (`CW_ACTIVITY_FEED_LABELS`); a feed's `labels` input still overrides them. A factory runs once, in an injection context, on first use.
 *
 * @param {Partial<CwActivityFeedLabels> | (() => Partial<CwActivityFeedLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwActivityFeedLabels(
  labels: Partial<CwActivityFeedLabels> | (() => Partial<CwActivityFeedLabels>),
): Provider {
  return ɵprovideLabels(ACTIVITY_FEED_LABELS, CW_ACTIVITY_FEED_LABELS, labels);
}
