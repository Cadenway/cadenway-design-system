import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { INLINE_EDIT_LABELS } from './inline-edit-labels.token';
import { CW_INLINE_EDIT_LABELS } from './inline-edit.constants';
import type { CwInlineEditLabels } from './inline-edit.types';

/**
 * Function provideCwInlineEditLabels
 *
 * @description
 * Supplies texts for this entry below the injector, merged over parent values and French defaults.
 * Individual inputs still override the provided values. A factory runs once in an injection context.
 *
 * @param {Partial<CwInlineEditLabels> | (() => Partial<CwInlineEditLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwInlineEditLabels(
  labels: Partial<CwInlineEditLabels> | (() => Partial<CwInlineEditLabels>),
): Provider {
  return ɵprovideLabels(INLINE_EDIT_LABELS, CW_INLINE_EDIT_LABELS, labels);
}
