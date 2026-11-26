import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_CHART_LABELS } from './chart.constants';
import type { CwChartLabels } from './chart.types';

/**
 * Constant CHART_LABELS
 *
 * @description
 * Injector-scoped texts merged over the defaults.
 *
 * @type {InjectionToken<Required<CwChartLabels>>}
 */
export const CHART_LABELS: InjectionToken<Required<CwChartLabels>> = ɵlabelsToken<
  Required<CwChartLabels>
>('CHART_LABELS', CW_CHART_LABELS);
