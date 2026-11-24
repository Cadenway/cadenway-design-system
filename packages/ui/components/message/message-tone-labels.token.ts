import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_MESSAGE_TONE_LABELS } from './message.constants';
import type { CwMessageToneLabels } from './message.types';

/**
 * Constant MESSAGE_TONE_LABELS
 *
 * @description
 * Texts of every message below the injector: the ones given by `provideCwMessageToneLabels`, over the
 * French defaults (`CW_MESSAGE_TONE_LABELS`) when nothing is provided.
 *
 * @type {InjectionToken<CwMessageToneLabels>}
 */
export const MESSAGE_TONE_LABELS: InjectionToken<CwMessageToneLabels> =
  ɵlabelsToken<CwMessageToneLabels>('MESSAGE_TONE_LABELS', CW_MESSAGE_TONE_LABELS);
