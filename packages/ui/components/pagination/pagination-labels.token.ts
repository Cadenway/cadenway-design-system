import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_PAGINATION_LABELS } from './pagination.constants';
import type { CwPaginationProvidedLabels } from './pagination.types';

/**
 * Constant PAGINATION_LABELS
 *
 * @description
 * Texts inherited by pagination declarations from the nearest provider.
 *
 * @type {InjectionToken<CwPaginationProvidedLabels>}
 */
export const PAGINATION_LABELS: InjectionToken<CwPaginationProvidedLabels> =
  ɵlabelsToken<CwPaginationProvidedLabels>('PAGINATION_LABELS', CW_PAGINATION_LABELS);
