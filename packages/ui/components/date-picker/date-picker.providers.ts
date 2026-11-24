import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';
import { DATE_PICKER_LABELS } from './date-picker-labels.token';
import { CW_DATE_PICKER_LABELS } from './date-picker.constants';
import type { CwDatePickerLabels } from './date-picker.types';

/**
 * Function provideCwDatePickerLabels
 *
 * @description
 * Replaces text defaults below this injector, merged over parent and French defaults. Individual
 * component inputs still override the provided texts. A factory runs once in an injection context.
 *
 * @param {Partial<CwDatePickerLabels> | (() => Partial<CwDatePickerLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwDatePickerLabels(
  labels: Partial<CwDatePickerLabels> | (() => Partial<CwDatePickerLabels>),
): Provider {
  return ɵprovideLabels(DATE_PICKER_LABELS, CW_DATE_PICKER_LABELS, labels);
}
