import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_CODE_BLOCK_LABELS } from './code-block.constants';
import type { CwCodeBlockLabels } from './code-block.types';

/**
 * Constant CODE_BLOCK_LABELS
 *
 * @description
 * Injector-scoped texts merged over the defaults.
 *
 * @type {InjectionToken<CwCodeBlockLabels>}
 */
export const CODE_BLOCK_LABELS: InjectionToken<CwCodeBlockLabels> = ɵlabelsToken<CwCodeBlockLabels>(
  'CODE_BLOCK_LABELS',
  CW_CODE_BLOCK_LABELS,
);
