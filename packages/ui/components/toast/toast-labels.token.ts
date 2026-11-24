import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_TOAST_LABELS } from './toast.constants';
import type { CwToastLabels } from './toast.types';

/**
 * Constant TOAST_LABELS
 *
 * @description
 * Resolved toast texts for the current injector.
 *
 * @type {InjectionToken<CwToastLabels>}
 */
export const TOAST_LABELS: InjectionToken<CwToastLabels> = ɵlabelsToken<CwToastLabels>(
  'TOAST_LABELS',
  CW_TOAST_LABELS,
);
