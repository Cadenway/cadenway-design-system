import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_SIDEBAR_LABELS } from './sidebar.constants';
import type { CwSidebarLabels } from './sidebar.types';

/**
 * Constant SIDEBAR_LABELS
 *
 * @description
 * Texts inherited from the provider or the French defaults.
 *
 * @type {InjectionToken<CwSidebarLabels>}
 */
export const SIDEBAR_LABELS: InjectionToken<CwSidebarLabels> = ɵlabelsToken<CwSidebarLabels>(
  'SIDEBAR_LABELS',
  CW_SIDEBAR_LABELS,
);
