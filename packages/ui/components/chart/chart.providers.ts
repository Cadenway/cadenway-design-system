import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { CHART_LABELS } from './chart-labels.token';
import { CW_CHART_LABELS } from './chart.constants';
import type { CwChartLabels } from './chart.types';

/**
 * Function provideCwChartLabels
 *
 * @description
 * Replaces texts below this injector, merged over parent texts and the defaults of `CW_CHART_LABELS`. `emptyText`, `categoryHeader`, `capacityLabel` and `othersLabel` inputs still override these texts.
 * A factory runs once in an injection context on first use.
 *
 * @param {Partial<CwChartLabels> | (() => Partial<CwChartLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwChartLabels(
  labels: Partial<CwChartLabels> | (() => Partial<CwChartLabels>),
): Provider {
  return ɵprovideLabels(CHART_LABELS, CW_CHART_LABELS, labels);
}
