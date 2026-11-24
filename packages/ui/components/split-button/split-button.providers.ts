import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { SPLIT_BUTTON_LABELS } from './split-button-labels.token';
import { CW_SPLIT_BUTTON_LABELS } from './split-button.constants';
import type { CwSplitButtonLabels } from './split-button.types';

/**
 * Function provideCwSplitButtonLabels
 *
 * @description
 * Sets the texts of every `cw-split-button` below the injector it is provided in (the application,
 * a route or a component subtree), merged over those of the parent injector, then over the French
 * defaults (`CW_SPLIT_BUTTON_LABELS`). A split button's `menuLabel` input still wins. A function is
 * called once, in an injection context, when a split button first reads its texts.
 *
 * @param {Partial<CwSplitButtonLabels> | (() => Partial<CwSplitButtonLabels>)} labels - Texts to
 * replace, or a function returning them.
 *
 * @returns {Provider} Provider of the merged split button texts.
 */
export function provideCwSplitButtonLabels(
  labels: Partial<CwSplitButtonLabels> | (() => Partial<CwSplitButtonLabels>),
): Provider {
  return ɵprovideLabels(SPLIT_BUTTON_LABELS, CW_SPLIT_BUTTON_LABELS, labels);
}
