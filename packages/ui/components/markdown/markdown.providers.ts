import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';
import { MARKDOWN_LABELS } from './markdown-labels.token';
import { CW_MARKDOWN_LABELS } from './markdown.constants';
import type { CwMarkdownLabels } from './markdown.types';

/**
 * Function provideCwMarkdownLabels
 *
 * @description
 * Replaces text defaults below this injector, merged over parent and French defaults. Individual
 * component inputs still override the provided texts. A factory runs once in an injection context.
 *
 * @param {Partial<CwMarkdownLabels> | (() => Partial<CwMarkdownLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwMarkdownLabels(
  labels: Partial<CwMarkdownLabels> | (() => Partial<CwMarkdownLabels>),
): Provider {
  return ɵprovideLabels(MARKDOWN_LABELS, CW_MARKDOWN_LABELS, labels);
}
