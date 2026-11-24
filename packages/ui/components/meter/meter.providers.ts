import type { Provider } from '@angular/core';
import { ɵprovideLabels } from '@cadenway/ui/core';
import { METER_LABELS } from './meter-labels.token';
import { CW_METER_LABELS } from './meter.constants';
import type { CwMeterLabels } from './meter.types';

/**
 * Function provideCwMeterLabels
 *
 * @description
 * Replaces text defaults below this injector, merged over parent and French defaults. Individual
 * component inputs still override the provided texts. A factory runs once in an injection context.
 *
 * @param {Partial<CwMeterLabels> | (() => Partial<CwMeterLabels>)} labels - Texts or a factory returning them.
 * @returns {Provider} Provider of the merged texts.
 */
export function provideCwMeterLabels(
  labels: Partial<CwMeterLabels> | (() => Partial<CwMeterLabels>),
): Provider {
  return ɵprovideLabels(METER_LABELS, CW_METER_LABELS, labels);
}
