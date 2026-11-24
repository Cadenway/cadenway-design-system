import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { getProvidedLabels } from './comment-composer.constants';
import type { CwCommentComposerProvidedLabels } from './comment-composer.types';

/**
 * Constant COMMENT_COMPOSER_LABELS
 *
 * @description
 * Texts provided to this entry, falling back to the French defaults.
 *
 * @type {InjectionToken<CwCommentComposerProvidedLabels>}
 */
export const COMMENT_COMPOSER_LABELS: InjectionToken<CwCommentComposerProvidedLabels> =
  ɵlabelsToken<CwCommentComposerProvidedLabels>('COMMENT_COMPOSER_LABELS', getProvidedLabels());
