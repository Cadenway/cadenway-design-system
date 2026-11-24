import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { TOAST_LABELS } from './toast-labels.token';
import { CW_TOAST_LABELS } from './toast.constants';
import type { CwToastLabels } from './toast.types';

/**
 * Function provideCwToastLabels
 *
 * @description
 * Sets texts for the injector subtree, merged over parent and French defaults. Explicit text
 * inputs override the provided values. A factory runs once in an injection context. The undo
 * text is resolved by CwToastService in its own injector; provide the service in a subtree too
 * if it needs a different undo text from the application instance.
 *
 * @param {Partial<CwToastLabels> | (() => Partial<CwToastLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwToastLabels(
  labels: Partial<CwToastLabels> | (() => Partial<CwToastLabels>),
): Provider {
  return ɵprovideLabels(TOAST_LABELS, CW_TOAST_LABELS, labels);
}
