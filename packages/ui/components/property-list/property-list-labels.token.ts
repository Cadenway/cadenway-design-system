import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_PROPERTY_LIST_LABELS } from './property-list.constants';
import type { CwPropertyListLabels } from './property-list.types';

/**
 * Constant PROPERTY_LIST_LABELS
 *
 * @description
 * Texts inherited from the provider or the French defaults.
 *
 * @type {InjectionToken<CwPropertyListLabels>}
 */
export const PROPERTY_LIST_LABELS: InjectionToken<CwPropertyListLabels> =
  ɵlabelsToken<CwPropertyListLabels>('PROPERTY_LIST_LABELS', CW_PROPERTY_LIST_LABELS);
