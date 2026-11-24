import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_STATUS_LABELS } from './status-icon.constants';
import type { CwStatusLabels } from './status-icon.types';

/**
 * Constant STATUS_LABELS
 *
 * @description
 * Status words below the injector: the ones given by `provideCwStatusLabels`, over the French
 * defaults (`CW_STATUS_LABELS`) when nothing is provided.
 *
 * @type {InjectionToken<CwStatusLabels>}
 */
export const STATUS_LABELS: InjectionToken<CwStatusLabels> = ɵlabelsToken<CwStatusLabels>(
  'STATUS_LABELS',
  CW_STATUS_LABELS,
);
