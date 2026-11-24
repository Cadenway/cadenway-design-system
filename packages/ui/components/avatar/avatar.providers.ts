import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { AVATAR_LABELS } from './avatar-labels.token';
import { CW_AVATAR_LABELS } from './avatar.constants';
import type { CwAvatarProvidedLabels } from './avatar.types';

/**
 * Function provideCwAvatarLabels
 *
 * @description
 * Provides texts to avatar declarations in an application, route or component subtree.
 * Values merge over the parent and French defaults; explicit inputs still take precedence. A
 * factory runs once in an injection context when the labels are first read.
 *
 * @param {Partial<CwAvatarProvidedLabels> | (() => Partial<CwAvatarProvidedLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwAvatarLabels(
  labels: Partial<CwAvatarProvidedLabels> | (() => Partial<CwAvatarProvidedLabels>),
): Provider {
  return ɵprovideLabels(AVATAR_LABELS, CW_AVATAR_LABELS, labels);
}
