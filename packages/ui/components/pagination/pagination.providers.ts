import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { PAGINATION_LABELS } from './pagination-labels.token';
import { CW_PAGINATION_LABELS } from './pagination.constants';
import type { CwPaginationProvidedLabels } from './pagination.types';

/**
 * Function provideCwPaginationLabels
 *
 * @description
 * Provides texts to pagination declarations in an application, route or component subtree.
 * Values merge over the parent and French defaults; explicit inputs still take precedence. A
 * factory runs once in an injection context when the labels are first read.
 *
 * @param {Partial<CwPaginationProvidedLabels> | (() => Partial<CwPaginationProvidedLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwPaginationLabels(
  labels: Partial<CwPaginationProvidedLabels> | (() => Partial<CwPaginationProvidedLabels>),
): Provider {
  return ɵprovideLabels(PAGINATION_LABELS, CW_PAGINATION_LABELS, labels);
}
