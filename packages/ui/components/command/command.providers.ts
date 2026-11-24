import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { COMMAND_LABELS } from './command-labels.token';
import { CW_COMMAND_LABELS } from './command.constants';
import type { CwCommandLabels } from './command.types';

/**
 * Function provideCwCommandLabels
 *
 * @description
 * Replaces texts below this injector, merged over parent texts and French defaults. `ariaLabel`, `emptyText`, `navigateLabel`, `runLabel`, `closeLabel` and `label` inputs still override the corresponding texts.
 * A factory runs once in an injection context on first use.
 *
 * @param {Partial<CwCommandLabels> | (() => Partial<CwCommandLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwCommandLabels(
  labels: Partial<CwCommandLabels> | (() => Partial<CwCommandLabels>),
): Provider {
  return ɵprovideLabels(COMMAND_LABELS, CW_COMMAND_LABELS, labels);
}
