import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { COMMENT_COMPOSER_LABELS } from './comment-composer-labels.token';
import { getProvidedLabels } from './comment-composer.constants';
import type { CwCommentComposerProvidedLabels } from './comment-composer.types';

/**
 * Function provideCwCommentComposerLabels
 *
 * @description
 * Supplies texts for this entry below the injector, merged over parent values and French defaults.
 * Individual inputs still override the provided values. A factory runs once in an injection context.
 *
 * @param {Partial<CwCommentComposerProvidedLabels> | (() => Partial<CwCommentComposerProvidedLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwCommentComposerLabels(
  labels:
    Partial<CwCommentComposerProvidedLabels> | (() => Partial<CwCommentComposerProvidedLabels>),
): Provider {
  return ɵprovideLabels(COMMENT_COMPOSER_LABELS, getProvidedLabels(), labels);
}
