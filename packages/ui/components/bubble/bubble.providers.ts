import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { BUBBLE_LABELS } from './bubble-labels.token';
import { CW_BUBBLE_LABELS } from './bubble.constants';
import type { CwBubbleLabels } from './bubble.types';

/**
 * Function provideCwBubbleLabels
 *
 * @description
 * Provides texts to bubble declarations in an application, route or component subtree.
 * Values merge over the parent and French defaults; explicit inputs still take precedence. A
 * factory runs once in an injection context when the labels are first read.
 *
 * @param {Partial<CwBubbleLabels> | (() => Partial<CwBubbleLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwBubbleLabels(
  labels: Partial<CwBubbleLabels> | (() => Partial<CwBubbleLabels>),
): Provider {
  return ɵprovideLabels(BUBBLE_LABELS, CW_BUBBLE_LABELS, labels);
}
