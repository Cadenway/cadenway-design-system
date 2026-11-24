import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { TOOLBAR_LABELS } from './toolbar-labels.token';
import { CW_TOOLBAR_LABELS } from './toolbar.constants';
import type { CwToolbarLabels } from './toolbar.types';

/**
 * Function provideCwToolbarLabels
 *
 * @description
 * Sets texts for the injector subtree, merged over parent and French defaults. Explicit text
 * inputs override the provided values. A factory runs once in an injection context.
 *
 * @param {Partial<CwToolbarLabels> | (() => Partial<CwToolbarLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwToolbarLabels(
  labels: Partial<CwToolbarLabels> | (() => Partial<CwToolbarLabels>),
): Provider {
  return ɵprovideLabels(TOOLBAR_LABELS, CW_TOOLBAR_LABELS, labels);
}
