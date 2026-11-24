import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_DATA_TABLE_PROVIDED_TEXTS } from './data-table.constants';
import type { CwDataTableProvidedTexts } from './data-table.types';

/**
 * Constant DATA_TABLE_TEXTS
 *
 * @description
 * Texts of every data-table below the injector: the ones given by `provideCwDataTableTexts`, over the
 * French defaults (`CW_DATA_TABLE_PROVIDED_TEXTS`) when nothing is provided.
 *
 * @type {InjectionToken<CwDataTableProvidedTexts>}
 */
export const DATA_TABLE_TEXTS: InjectionToken<CwDataTableProvidedTexts> =
  ɵlabelsToken<CwDataTableProvidedTexts>('DATA_TABLE_TEXTS', CW_DATA_TABLE_PROVIDED_TEXTS);
