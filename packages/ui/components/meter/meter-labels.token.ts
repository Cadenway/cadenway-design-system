import type { InjectionToken } from '@angular/core';
import { ɵlabelsToken } from '@cadenway/ui/core';
import { CW_METER_LABELS } from './meter.constants';
import type { CwMeterLabels } from './meter.types';

/**
 * Constant METER_LABELS
 *
 * @description
 * Merged text defaults for the current injector.
 *
 * @type {InjectionToken<CwMeterLabels>}
 */
export const METER_LABELS: InjectionToken<CwMeterLabels> = ɵlabelsToken<CwMeterLabels>(
  'METER_LABELS',
  CW_METER_LABELS,
);
