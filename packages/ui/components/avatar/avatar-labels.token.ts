import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_AVATAR_LABELS } from './avatar.constants';
import type { CwAvatarProvidedLabels } from './avatar.types';

/**
 * Constant AVATAR_LABELS
 *
 * @description
 * Texts inherited by avatar declarations from the nearest provider.
 *
 * @type {InjectionToken<CwAvatarProvidedLabels>}
 */
export const AVATAR_LABELS: InjectionToken<CwAvatarProvidedLabels> =
  ɵlabelsToken<CwAvatarProvidedLabels>('AVATAR_LABELS', CW_AVATAR_LABELS);
