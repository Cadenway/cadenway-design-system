import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';
import { CW_MARKDOWN_LABELS } from './markdown.constants';
import type { CwMarkdownLabels } from './markdown.types';

/**
 * Constant MARKDOWN_LABELS
 *
 * @description
 * Merged text defaults for the current injector.
 *
 * @type {InjectionToken<CwMarkdownLabels>}
 */
export const MARKDOWN_LABELS: InjectionToken<CwMarkdownLabels> = ɵlabelsToken<CwMarkdownLabels>(
  'MARKDOWN_LABELS',
  CW_MARKDOWN_LABELS,
);
