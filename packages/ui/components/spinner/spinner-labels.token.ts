import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_SPINNER_LABELS } from './spinner.constants';
import type { CwSpinnerLabels } from './spinner.types';

/**
 * Constant SPINNER_LABELS
 *
 * @description
 * Resolved spinner texts for the current injector.
 *
 * @type {InjectionToken<CwSpinnerLabels>}
 */
export const SPINNER_LABELS: InjectionToken<CwSpinnerLabels> = ɵlabelsToken<CwSpinnerLabels>(
  'SPINNER_LABELS',
  CW_SPINNER_LABELS,
);
