import type { CwActivityFeedLabels } from './activity-feed.types';

/**
 * Constant CW_ACTIVITY_FEED_LABELS
 *
 * @description
 * The French texts of `cw-activity-feed`, word for word from the mockup (`App.dc.html`, list activity), in one place so that a later `@angular/localize` extraction is mechanical.
 *
 * @type {CwActivityFeedLabels}
 */
export const CW_ACTIVITY_FEED_LABELS: CwActivityFeedLabels = {
  today: 'Aujourd’hui',
  yesterday: 'Hier',
  count: (count: number): string => `· ${String(count)}`,
  emptyText: 'Aucune activité ne correspond',
  loading: 'Chargement de l’activité',
};
