import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { STAT_LABELS } from './stat-labels.token';
import { CW_STAT_LABELS } from './stat.constants';
import type { CwStatLabels } from './stat.types';

/**
 * Function provideCwStatLabels
 *
 * @description
 * Sets the texts of every `cw-stat` below the injector it is provided in (the application, a
 * route or a component subtree), for example the English source copy of an application translated
 * with `$localize`. The texts are merged over those of the parent injector, then over the French
 * defaults (`CW_STAT_LABELS`); a stat's `refreshingLabel` and `trendLabels` inputs still override them. A function is
 * called once, in an injection context, when a stat first reads its texts.
 *
 * @param {Partial<CwStatLabels> | (() => Partial<CwStatLabels>)} labels - Texts to replace, or a
 * function returning them.
 *
 * @returns {Provider} Provider of the merged stat texts.
 */
export function provideCwStatLabels(
  labels: Partial<CwStatLabels> | (() => Partial<CwStatLabels>),
): Provider {
  return ɵprovideLabels(STAT_LABELS, CW_STAT_LABELS, labels);
}
