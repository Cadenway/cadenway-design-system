/*
 * Public API of @cadenway/ui/components/activity-feed: the activity log of the list Activity view
 * and the task detail's Activity tab (mockup `App.dc.html`).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwActivityDetailDef } from './activity-detail/activity-detail.directive';
export { CwActivityFeed } from './activity-feed.component';
export { CwActivityFeedEmpty } from './activity-feed-empty/activity-feed-empty.directive';
export { CwActivitySummaryDef } from './activity-summary/activity-summary.directive';
export { CW_ACTIVITY_FEED_LABELS } from './activity-feed.constants';
export { provideCwActivityFeedLabels } from './activity-feed.providers';
export type {
  CwActivityActor,
  CwActivityEmphasis,
  CwActivityEntry,
  CwActivityEntryContext,
  CwActivityFeedLabels,
  CwActivityPart,
  CwActivitySegment,
} from './activity-feed.types';
