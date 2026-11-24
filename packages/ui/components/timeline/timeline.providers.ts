import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';
import { TIMELINE_LABELS } from './timeline-labels.token';
import { CW_TIMELINE_LABELS } from './timeline.constants';
import type { CwTimelineLabels } from './timeline.types';

/**
 * Function provideCwTimelineLabels
 *
 * @description
 * Sets timeline texts below the injector over parent texts and French defaults. The nameHeader,
 * undatedLabel and scheduleLabel inputs override the provided values. A factory runs once in an
 * injection context when first read.
 *
 * @param {Partial<CwTimelineLabels> | (() => Partial<CwTimelineLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged timeline texts.
 */
export function provideCwTimelineLabels(
  labels: Partial<CwTimelineLabels> | (() => Partial<CwTimelineLabels>),
): Provider {
  return ɵprovideLabels(TIMELINE_LABELS, CW_TIMELINE_LABELS, labels);
}
