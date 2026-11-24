import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_COMMAND_LABELS } from './command.constants';
import type { CwCommandLabels } from './command.types';

/**
 * Constant COMMAND_LABELS
 *
 * @description
 * Injector-scoped texts merged over the defaults.
 *
 * @type {InjectionToken<CwCommandLabels>}
 */
export const COMMAND_LABELS: InjectionToken<CwCommandLabels> = ɵlabelsToken<CwCommandLabels>(
  'COMMAND_LABELS',
  CW_COMMAND_LABELS,
);
