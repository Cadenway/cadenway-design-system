import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { BANNER_LABELS } from './banner-labels.token';
import { CW_BANNER_LABELS } from './banner.constants';
import type { CwBannerLabels } from './banner.types';

/**
 * Function provideCwBannerLabels
 *
 * @description
 * Replaces default texts below this injector, merging with parent labels. Individual text inputs
 * still override these values. A factory runs once in an injection context when labels are read.
 *
 * @param {Partial<CwBannerLabels> | (() => Partial<CwBannerLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of merged texts.
 */
export function provideCwBannerLabels(
  labels: Partial<CwBannerLabels> | (() => Partial<CwBannerLabels>),
): Provider {
  return ɵprovideLabels(BANNER_LABELS, CW_BANNER_LABELS, labels);
}
