import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';
import { CW_KBD_LABELS } from './kbd.constants';
import type { CwKbdLabels } from './kbd.types';

/**
 * Constant KBD_LABELS
 *
 * @description
 * Merged shortcut texts for the current injector.
 *
 * @type {InjectionToken<CwKbdLabels>}
 */
export const KBD_LABELS: InjectionToken<CwKbdLabels> = ɵlabelsToken<CwKbdLabels>(
  'KBD_LABELS',
  CW_KBD_LABELS,
);
