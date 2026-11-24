import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { BADGE_LABELS } from './badge-labels.token';
import { CW_BADGE_LABELS } from './badge.constants';
import type { CwBadgeLabels } from './badge.types';

/**
 * Function provideCwBadgeLabels
 *
 * @description
 * Sets the texts of every `cw-badge` below the injector it is provided in (the application, a
 * route or a component subtree), for example the English source copy of an application translated
 * with `$localize`. The texts are merged over those of the parent injector, then over the French
 * defaults (`CW_BADGE_LABELS`); a priority badge's `ariaLabel` input still overrides them. A function is
 * called once, in an injection context, when a badge first reads its texts.
 *
 * @param {Partial<CwBadgeLabels> | (() => Partial<CwBadgeLabels>)} labels - Texts to replace, or a
 * function returning them.
 *
 * @returns {Provider} Provider of the merged badge texts.
 */
export function provideCwBadgeLabels(
  labels: Partial<CwBadgeLabels> | (() => Partial<CwBadgeLabels>),
): Provider {
  return ɵprovideLabels(BADGE_LABELS, CW_BADGE_LABELS, labels);
}
