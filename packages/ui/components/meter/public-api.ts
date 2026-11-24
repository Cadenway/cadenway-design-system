/*
 * Public API of @cadenway/ui/meter (Meter sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwMeter } from './meter.component';
export type {
  CwMeterFormat,
  CwMeterSeries,
  CwMeterSize,
  CwMeterVariant,
  CwMeterZone,
} from './meter.types';

export { CW_METER_LABELS } from './meter.constants';
export { provideCwMeterLabels } from './meter.providers';
export type { CwMeterLabels } from './meter.types';
