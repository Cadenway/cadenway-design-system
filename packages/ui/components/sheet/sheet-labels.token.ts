import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_SHEET_LABELS } from './sheet.constants';
import type { CwSheetLabels } from './sheet.types';

/**
 * Constant SHEET_LABELS
 *
 * @description
 * Texts of every sheet below the injector: the ones given by `provideCwSheetLabels`, over the
 * French defaults (`CW_SHEET_LABELS`) when nothing is provided.
 *
 * @type {InjectionToken<CwSheetLabels>}
 */
export const SHEET_LABELS: InjectionToken<CwSheetLabels> = ɵlabelsToken<CwSheetLabels>(
  'SHEET_LABELS',
  CW_SHEET_LABELS,
);
