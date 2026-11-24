import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';
import { CW_FILTER_BAR_LABELS } from './filter-bar.constants';
import type { CwFilterBarLabels } from './filter-bar.types';
/**
 * Constant FILTER_BAR_LABELS
 *
 * @description
 * Texts provided below the injector, falling back to the French defaults.
 *
 * @type {InjectionToken<CwFilterBarLabels>}
 */
export const FILTER_BAR_LABELS: InjectionToken<CwFilterBarLabels> = ɵlabelsToken<CwFilterBarLabels>(
  'FILTER_BAR_LABELS',
  CW_FILTER_BAR_LABELS,
);
