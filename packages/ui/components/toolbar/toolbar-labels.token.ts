import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_TOOLBAR_LABELS } from './toolbar.constants';
import type { CwToolbarLabels } from './toolbar.types';

/**
 * Constant TOOLBAR_LABELS
 *
 * @description
 * Resolved toolbar texts for the current injector.
 *
 * @type {InjectionToken<CwToolbarLabels>}
 */
export const TOOLBAR_LABELS: InjectionToken<CwToolbarLabels> = ɵlabelsToken<CwToolbarLabels>(
  'TOOLBAR_LABELS',
  CW_TOOLBAR_LABELS,
);
