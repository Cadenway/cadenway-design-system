import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { HEAT_GRID_LABELS } from './heat-grid-labels.token';
import { CW_HEAT_GRID_LABELS } from './heat-grid.constants';
import type { CwHeatGridLabels } from './heat-grid.types';

/**
 * Function provideCwHeatGridLabels
 *
 * @description
 * Replaces the texts of every `cw-heat-grid` below this injector (the application, a route, a component subtree), merged over the parent's texts and the French defaults (`CW_HEAT_GRID_LABELS`); a grid's `labels` input still overrides them. A factory runs once, in an injection context, on first use.
 *
 * @param {Partial<CwHeatGridLabels> | (() => Partial<CwHeatGridLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwHeatGridLabels(
  labels: Partial<CwHeatGridLabels> | (() => Partial<CwHeatGridLabels>),
): Provider {
  return ɵprovideLabels(HEAT_GRID_LABELS, CW_HEAT_GRID_LABELS, labels);
}
