import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';
import { CW_RELATIONS_LABELS } from './relations.constants';
import type { CwRelationsLabels } from './relations.types';
/**
 * Constant RELATIONS_LABELS
 *
 * @description
 * Texts provided below the injector, falling back to the French defaults.
 *
 * @type {InjectionToken<CwRelationsLabels>}
 */
export const RELATIONS_LABELS: InjectionToken<CwRelationsLabels> = ɵlabelsToken<CwRelationsLabels>(
  'RELATIONS_LABELS',
  CW_RELATIONS_LABELS,
);
