import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_BANNER_LABELS } from './banner.constants';
import type { CwBannerLabels } from './banner.types';

/**
 * Constant BANNER_LABELS
 *
 * @description
 * Injector-scoped texts with French defaults.
 *
 * @type {InjectionToken<CwBannerLabels>}
 */
export const BANNER_LABELS: InjectionToken<CwBannerLabels> = ɵlabelsToken<CwBannerLabels>(
  'BANNER_LABELS',
  CW_BANNER_LABELS,
);
