import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_ALERT_LABELS } from './alert.constants';
import type { CwAlertLabels } from './alert.types';

/**
 * Constant ALERT_LABELS
 *
 * @description
 * Injector-scoped texts with French defaults.
 *
 * @type {InjectionToken<CwAlertLabels>}
 */
export const ALERT_LABELS: InjectionToken<CwAlertLabels> = ɵlabelsToken<CwAlertLabels>(
  'ALERT_LABELS',
  CW_ALERT_LABELS,
);
