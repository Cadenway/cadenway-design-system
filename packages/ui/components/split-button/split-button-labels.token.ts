import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_SPLIT_BUTTON_LABELS } from './split-button.constants';
import type { CwSplitButtonLabels } from './split-button.types';

/**
 * Constant SPLIT_BUTTON_LABELS
 *
 * @description
 * Texts of every split button below the injector: the ones given by `provideCwSplitButtonLabels`,
 * over the French defaults when nothing is provided.
 *
 * @type {InjectionToken<CwSplitButtonLabels>}
 */
export const SPLIT_BUTTON_LABELS: InjectionToken<CwSplitButtonLabels> =
  ɵlabelsToken<CwSplitButtonLabels>('SPLIT_BUTTON_LABELS', CW_SPLIT_BUTTON_LABELS);
