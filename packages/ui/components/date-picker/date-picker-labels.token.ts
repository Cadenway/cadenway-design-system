import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';
import { CW_DATE_PICKER_LABELS } from './date-picker.constants';
import type { CwDatePickerLabels } from './date-picker.types';

/**
 * Constant DATE_PICKER_LABELS
 *
 * @description
 * Merged text defaults for the current injector.
 *
 * @type {InjectionToken<CwDatePickerLabels>}
 */
export const DATE_PICKER_LABELS: InjectionToken<CwDatePickerLabels> =
  ɵlabelsToken<CwDatePickerLabels>('DATE_PICKER_LABELS', CW_DATE_PICKER_LABELS);
