import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_COMBOBOX_LABELS } from './combobox.constants';
import type { CwComboboxLabels } from './combobox.types';

/**
 * Constant COMBOBOX_LABELS
 *
 * @description
 * Injector-scoped texts merged over the defaults.
 *
 * @type {InjectionToken<CwComboboxLabels>}
 */
export const COMBOBOX_LABELS: InjectionToken<CwComboboxLabels> = ɵlabelsToken<CwComboboxLabels>(
  'COMBOBOX_LABELS',
  CW_COMBOBOX_LABELS,
);
