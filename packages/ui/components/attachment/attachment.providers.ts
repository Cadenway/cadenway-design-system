import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { ATTACHMENT_LABELS } from './attachment-labels.token';
import { CW_ATTACHMENT_LABELS } from './attachment.constants';
import type { CwAttachmentProvidedLabels } from './attachment.types';

/**
 * Function provideCwAttachmentLabels
 *
 * @description
 * Provides texts to attachment declarations in an application, route or component subtree.
 * Values merge over the parent and French defaults; explicit inputs still take precedence. A
 * factory runs once in an injection context when the labels are first read.
 *
 * @param {Partial<CwAttachmentProvidedLabels> | (() => Partial<CwAttachmentProvidedLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwAttachmentLabels(
  labels: Partial<CwAttachmentProvidedLabels> | (() => Partial<CwAttachmentProvidedLabels>),
): Provider {
  return ɵprovideLabels(ATTACHMENT_LABELS, CW_ATTACHMENT_LABELS, labels);
}
