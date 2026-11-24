import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';
import { PAGE_HEADER_LABELS } from './page-header-labels.token';
import { CW_PAGE_HEADER_LABELS } from './page-header.constants';
import type { CwPageHeaderLabels } from './page-header.types';

/**
 * Function provideCwPageHeaderLabels
 *
 * @description
 * Replaces text defaults below this injector, merged over parent and French defaults. Individual
 * component inputs still override the provided texts. A factory runs once in an injection context.
 *
 * @param {Partial<CwPageHeaderLabels> | (() => Partial<CwPageHeaderLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwPageHeaderLabels(
  labels: Partial<CwPageHeaderLabels> | (() => Partial<CwPageHeaderLabels>),
): Provider {
  return ɵprovideLabels(PAGE_HEADER_LABELS, CW_PAGE_HEADER_LABELS, labels);
}
