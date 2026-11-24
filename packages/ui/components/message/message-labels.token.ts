import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_MESSAGE_LABELS } from './message.constants';
import type { CwMessageLabels } from './message.types';

/**
 * Constant MESSAGE_LABELS
 *
 * @description
 * Texts of every message below the injector: the ones given by `provideCwMessageLabels`, over the
 * French defaults (`CW_MESSAGE_LABELS`) when nothing is provided.
 *
 * @type {InjectionToken<CwMessageLabels>}
 */
export const MESSAGE_LABELS: InjectionToken<CwMessageLabels> = ɵlabelsToken<CwMessageLabels>(
  'MESSAGE_LABELS',
  CW_MESSAGE_LABELS,
);
