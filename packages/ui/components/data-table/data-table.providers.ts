import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';

import { DATA_TABLE_TEXTS } from './data-table-texts.token';
import { CW_DATA_TABLE_PROVIDED_TEXTS } from './data-table.constants';
import type { CwDataTableProvidedTexts } from './data-table.types';

/**
 * Function provideCwDataTableTexts
 *
 * @description
 * Sets the texts of every `cw-data-table` below the injector it is provided in (the application, a
 * route or a component subtree), for example the English source copy of an application translated
 * with `$localize`. The texts are merged over those of the parent injector, then over the French
 * defaults (`CW_DATA_TABLE_PROVIDED_TEXTS`); the table's `texts` and `emptyText` inputs still override them. A function is
 * called once, in an injection context, when a table first reads its texts.
 *
 * @param {Partial<CwDataTableProvidedTexts> | (() => Partial<CwDataTableProvidedTexts>)} labels - Texts to replace, or a
 * function returning them.
 *
 * @returns {Provider} Provider of the merged table texts.
 */
export function provideCwDataTableTexts(
  labels: Partial<CwDataTableProvidedTexts> | (() => Partial<CwDataTableProvidedTexts>),
): Provider {
  return ɵprovideLabels(DATA_TABLE_TEXTS, CW_DATA_TABLE_PROVIDED_TEXTS, labels);
}
