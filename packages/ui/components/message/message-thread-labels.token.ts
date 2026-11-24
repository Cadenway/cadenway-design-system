import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_MESSAGE_THREAD_LABELS } from './message.constants';
import type { CwMessageThreadLabels } from './message.types';

/**
 * Constant MESSAGE_THREAD_LABELS
 *
 * @description
 * Texts of every message below the injector: the ones given by `provideCwMessageThreadLabels`, over the
 * French defaults (`CW_MESSAGE_THREAD_LABELS`) when nothing is provided.
 *
 * @type {InjectionToken<CwMessageThreadLabels>}
 */
export const MESSAGE_THREAD_LABELS: InjectionToken<CwMessageThreadLabels> =
  ɵlabelsToken<CwMessageThreadLabels>('MESSAGE_THREAD_LABELS', CW_MESSAGE_THREAD_LABELS);
