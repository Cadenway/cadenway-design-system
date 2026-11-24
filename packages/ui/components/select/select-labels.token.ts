import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_SELECT_LABELS } from './select.constants';
import type { CwSelectLabels } from './select.types';

/**
 * Constant SELECT_LABELS
 *
 * @description
 * Texts inherited from the provider or the French defaults.
 *
 * @type {InjectionToken<CwSelectLabels>}
 */
export const SELECT_LABELS: InjectionToken<CwSelectLabels> = ɵlabelsToken<CwSelectLabels>(
  'SELECT_LABELS',
  CW_SELECT_LABELS,
);
