import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { BLOCK_EDITOR_LABELS } from './block-editor-labels.token';
import { getProvidedLabels } from './block-editor.constants';
import type { CwBlockEditorProvidedLabels } from './block-editor.types';

/**
 * Function provideCwBlockEditorLabels
 *
 * @description
 * Supplies texts for this entry below the injector, merged over parent values and French defaults.
 * Individual inputs still override the provided values. A factory runs once in an injection context.
 *
 * @param {Partial<CwBlockEditorProvidedLabels> | (() => Partial<CwBlockEditorProvidedLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwBlockEditorLabels(
  labels: Partial<CwBlockEditorProvidedLabels> | (() => Partial<CwBlockEditorProvidedLabels>),
): Provider {
  return ɵprovideLabels(BLOCK_EDITOR_LABELS, getProvidedLabels(), labels);
}
