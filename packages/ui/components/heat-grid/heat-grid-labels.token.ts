import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_HEAT_GRID_LABELS } from './heat-grid.constants';
import type { CwHeatGridLabels } from './heat-grid.types';

/**
 * Constant HEAT_GRID_LABELS
 *
 * @description
 * Texts of every heat grid below the injector, merged over `CW_HEAT_GRID_LABELS`.
 *
 * @type {InjectionToken<CwHeatGridLabels>}
 */
export const HEAT_GRID_LABELS: InjectionToken<CwHeatGridLabels> = ɵlabelsToken<CwHeatGridLabels>(
  'HEAT_GRID_LABELS',
  CW_HEAT_GRID_LABELS,
);
