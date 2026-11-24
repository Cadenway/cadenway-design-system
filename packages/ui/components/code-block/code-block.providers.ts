import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { CODE_BLOCK_LABELS } from './code-block-labels.token';
import { CW_CODE_BLOCK_LABELS } from './code-block.constants';
import type { CwCodeBlockLabels } from './code-block.types';

/**
 * Function provideCwCodeBlockLabels
 *
 * @description
 * Replaces texts below this injector, merged over parent texts and French defaults. `copyLabel`, `copiedLabel`, `addedLabel` and `removedLabel` inputs still override these texts.
 * A factory runs once in an injection context on first use.
 *
 * @param {Partial<CwCodeBlockLabels> | (() => Partial<CwCodeBlockLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwCodeBlockLabels(
  labels: Partial<CwCodeBlockLabels> | (() => Partial<CwCodeBlockLabels>),
): Provider {
  return ɵprovideLabels(CODE_BLOCK_LABELS, CW_CODE_BLOCK_LABELS, labels);
}
