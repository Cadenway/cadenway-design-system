import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { getProvidedLabels } from './checklist.constants';
import type { CwChecklistProvidedLabels } from './checklist.types';

/**
 * Constant CHECKLIST_LABELS
 *
 * @description
 * Texts provided to this entry, falling back to the French defaults.
 *
 * @type {InjectionToken<CwChecklistProvidedLabels>}
 */
export const CHECKLIST_LABELS: InjectionToken<CwChecklistProvidedLabels> =
  ɵlabelsToken<CwChecklistProvidedLabels>('CHECKLIST_LABELS', getProvidedLabels());
