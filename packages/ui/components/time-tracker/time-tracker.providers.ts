import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { TIME_TRACKER_LABELS } from './time-tracker-labels.token';
import { CW_TIME_TRACKER_LABELS } from './time-tracker.constants';
import type { CwTimeTrackerLabels } from './time-tracker.types';
/**
 * Function provideCwTimeTrackerLabels
 *
 * @description
 * Sets texts below this injector, merged over parent texts and French defaults. The `labels`
 * input overrides these values. A factory runs once in an injection context when first read.
 *
 * @param {Partial<CwTimeTrackerLabels> | (() => Partial<CwTimeTrackerLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwTimeTrackerLabels(
  labels: Partial<CwTimeTrackerLabels> | (() => Partial<CwTimeTrackerLabels>),
): Provider {
  return ɵprovideLabels(TIME_TRACKER_LABELS, CW_TIME_TRACKER_LABELS, labels);
}

import { TIME_ENTRY_FORM_LABELS } from './time-entry-form-labels.token';
import { CW_TIME_ENTRY_FORM_LABELS } from './time-tracker.constants';
import type { CwTimeEntryFormLabels } from './time-tracker.types';
/**
 * Function provideCwTimeEntryFormLabels
 *
 * @description
 * Sets texts below this injector, merged over parent texts and French defaults. The `labels`
 * input overrides these values. A factory runs once in an injection context when first read.
 *
 * @param {Partial<CwTimeEntryFormLabels> | (() => Partial<CwTimeEntryFormLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwTimeEntryFormLabels(
  labels: Partial<CwTimeEntryFormLabels> | (() => Partial<CwTimeEntryFormLabels>),
): Provider {
  return ɵprovideLabels(TIME_ENTRY_FORM_LABELS, CW_TIME_ENTRY_FORM_LABELS, labels);
}

import { TIME_ENTRY_LIST_LABELS } from './time-entry-list-labels.token';
import { CW_TIME_ENTRY_LIST_LABELS } from './time-tracker.constants';
import type { CwTimeEntryListLabels } from './time-tracker.types';
/**
 * Function provideCwTimeEntryListLabels
 *
 * @description
 * Sets texts below this injector, merged over parent texts and French defaults. The `labels`
 * input overrides these values. A factory runs once in an injection context when first read.
 *
 * @param {Partial<CwTimeEntryListLabels> | (() => Partial<CwTimeEntryListLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwTimeEntryListLabels(
  labels: Partial<CwTimeEntryListLabels> | (() => Partial<CwTimeEntryListLabels>),
): Provider {
  return ɵprovideLabels(TIME_ENTRY_LIST_LABELS, CW_TIME_ENTRY_LIST_LABELS, labels);
}
