import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { getProvidedLabels } from './block-editor.constants';
import type { CwBlockEditorProvidedLabels } from './block-editor.types';

/**
 * Constant BLOCK_EDITOR_LABELS
 *
 * @description
 * Texts provided to this entry, falling back to the French defaults.
 *
 * @type {InjectionToken<CwBlockEditorProvidedLabels>}
 */
export const BLOCK_EDITOR_LABELS: InjectionToken<CwBlockEditorProvidedLabels> =
  ɵlabelsToken<CwBlockEditorProvidedLabels>('BLOCK_EDITOR_LABELS', getProvidedLabels());
