import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';
import { KBD_LABELS } from './kbd-labels.token';
import { CW_KBD_LABELS } from './kbd.constants';
import type { CwKbdLabels } from './kbd.types';

/**
 * Function provideCwKbdLabels
 *
 * @description
 * Replaces shortcut texts below the injector, merged over parent and French defaults. The
 * `thenLabel` input still overrides the provided text. A factory runs once in an injection context.
 *
 * @param {Partial<CwKbdLabels> | (() => Partial<CwKbdLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwKbdLabels(
  labels: Partial<CwKbdLabels> | (() => Partial<CwKbdLabels>),
): Provider {
  return ɵprovideLabels(KBD_LABELS, CW_KBD_LABELS, labels);
}
