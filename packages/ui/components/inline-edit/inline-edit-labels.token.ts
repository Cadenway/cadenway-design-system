import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';

import { CW_INLINE_EDIT_LABELS } from './inline-edit.constants';
import type { CwInlineEditLabels } from './inline-edit.types';

/**
 * Constant INLINE_EDIT_LABELS
 *
 * @description
 * Texts provided to this entry, falling back to the French defaults.
 *
 * @type {InjectionToken<CwInlineEditLabels>}
 */
export const INLINE_EDIT_LABELS: InjectionToken<CwInlineEditLabels> =
  ɵlabelsToken<CwInlineEditLabels>('INLINE_EDIT_LABELS', CW_INLINE_EDIT_LABELS);
