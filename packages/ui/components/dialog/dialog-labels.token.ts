import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_DIALOG_LABELS } from './dialog.constants';
import type { CwDialogLabels } from './dialog.types';

/**
 * Constant DIALOG_LABELS
 *
 * @description
 * Texts of every dialog below the injector: the ones given by `provideCwDialogLabels`, over the
 * French defaults (`CW_DIALOG_LABELS`) when nothing is provided.
 *
 * @type {InjectionToken<CwDialogLabels>}
 */
export const DIALOG_LABELS: InjectionToken<CwDialogLabels> = ɵlabelsToken<CwDialogLabels>(
  'DIALOG_LABELS',
  CW_DIALOG_LABELS,
);
