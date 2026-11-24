import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_BREADCRUMB_LABELS } from './breadcrumb.constants';
import type { CwBreadcrumbLabels } from './breadcrumb.types';

/**
 * Constant BREADCRUMB_LABELS
 *
 * @description
 * Injector-scoped texts with French defaults.
 *
 * @type {InjectionToken<CwBreadcrumbLabels>}
 */
export const BREADCRUMB_LABELS: InjectionToken<CwBreadcrumbLabels> =
  ɵlabelsToken<CwBreadcrumbLabels>('BREADCRUMB_LABELS', CW_BREADCRUMB_LABELS);
