import { inject, type Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { CW_STATUS_LABELS } from './status-icon.constants';
import type { CwStatusLabels } from './status-icon.types';
import { STATUS_LABELS } from './status-labels.token';

/**
 * Function provideCwStatusLabels
 *
 * @description
 * Sets the status words below the injector it is provided in (the application, a route or a
 * component subtree), for example the English source copy of an application translated with
 * `$localize`. `cw-status-badge`, `cw-timeline` and every reader of `injectCwStatusLabels` use them.
 * The words are merged over those of the parent injector, then over the French defaults
 * (`CW_STATUS_LABELS`); a badge's `label` input still overrides them. A function is called once, in
 * an injection context, when the words are first read.
 *
 * @param {Partial<CwStatusLabels> | (() => Partial<CwStatusLabels>)} labels - Words to replace, or a
 * function returning them.
 *
 * @returns {Provider} Provider of the merged status words.
 */
export function provideCwStatusLabels(
  labels: Partial<CwStatusLabels> | (() => Partial<CwStatusLabels>),
): Provider {
  return ɵprovideLabels(STATUS_LABELS, CW_STATUS_LABELS, labels);
}

/**
 * Function injectCwStatusLabels
 *
 * @description
 * Returns the status words in effect for the current injector (`provideCwStatusLabels`, or the
 * French defaults), so a brick or a consumer writes the same word next to a status icon. Call it in
 * an injection context, such as a field initializer.
 *
 * @returns {CwStatusLabels} The word of each status key.
 */
export function injectCwStatusLabels(): CwStatusLabels {
  return inject(STATUS_LABELS);
}
