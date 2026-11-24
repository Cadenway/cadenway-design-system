import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_ATTACHMENT_LABELS } from './attachment.constants';
import type { CwAttachmentProvidedLabels } from './attachment.types';

/**
 * Constant ATTACHMENT_LABELS
 *
 * @description
 * Texts inherited by attachment declarations from the nearest provider.
 *
 * @type {InjectionToken<CwAttachmentProvidedLabels>}
 */
export const ATTACHMENT_LABELS: InjectionToken<CwAttachmentProvidedLabels> =
  ɵlabelsToken<CwAttachmentProvidedLabels>('ATTACHMENT_LABELS', CW_ATTACHMENT_LABELS);
