import { inject, type Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { CW_PRIORITY_LABELS } from './priority-icon.constants';
import type { CwPriorityLabels } from './priority-icon.types';
import { PRIORITY_LABELS } from './priority-labels.token';

/**
 * Function provideCwPriorityLabels
 *
 * @description
 * Sets the priority words below the injector it is provided in (the application, a route or a
 * component subtree), for example the English source copy of an application translated with
 * `$localize`. `cw-priority-badge` and every reader of `injectCwPriorityLabels` use them.
 * The words are merged over those of the parent injector, then over the French defaults
 * (`CW_PRIORITY_LABELS`); a badge's `label` input still overrides them. A function is called once, in
 * an injection context, when the words are first read.
 *
 * @param {Partial<CwPriorityLabels> | (() => Partial<CwPriorityLabels>)} labels - Words to replace, or a
 * function returning them.
 *
 * @returns {Provider} Provider of the merged priority words.
 */
export function provideCwPriorityLabels(
  labels: Partial<CwPriorityLabels> | (() => Partial<CwPriorityLabels>),
): Provider {
  return ɵprovideLabels(PRIORITY_LABELS, CW_PRIORITY_LABELS, labels);
}

/**
 * Function injectCwPriorityLabels
 *
 * @description
 * Returns the priority words in effect for the current injector (`provideCwPriorityLabels`, or the
 * French defaults), so a brick or a consumer writes the same word next to a priority icon. Call it in
 * an injection context, such as a field initializer.
 *
 * @returns {CwPriorityLabels} The word of each priority key.
 */
export function injectCwPriorityLabels(): CwPriorityLabels {
  return inject(PRIORITY_LABELS);
}
