import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';
import { CW_PAGE_HEADER_LABELS } from './page-header.constants';
import type { CwPageHeaderLabels } from './page-header.types';

/**
 * Constant PAGE_HEADER_LABELS
 *
 * @description
 * Merged text defaults for the current injector.
 *
 * @type {InjectionToken<CwPageHeaderLabels>}
 */
export const PAGE_HEADER_LABELS: InjectionToken<CwPageHeaderLabels> =
  ɵlabelsToken<CwPageHeaderLabels>('PAGE_HEADER_LABELS', CW_PAGE_HEADER_LABELS);
