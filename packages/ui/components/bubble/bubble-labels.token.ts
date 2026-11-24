import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_BUBBLE_LABELS } from './bubble.constants';
import type { CwBubbleLabels } from './bubble.types';

/**
 * Constant BUBBLE_LABELS
 *
 * @description
 * Texts inherited by bubble declarations from the nearest provider.
 *
 * @type {InjectionToken<CwBubbleLabels>}
 */
export const BUBBLE_LABELS: InjectionToken<CwBubbleLabels> = ɵlabelsToken<CwBubbleLabels>(
  'BUBBLE_LABELS',
  CW_BUBBLE_LABELS,
);
