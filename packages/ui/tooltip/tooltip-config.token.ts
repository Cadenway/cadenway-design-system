import { InjectionToken } from '@angular/core';

import type { CwTooltipConfig } from './tooltip.types';

/** The delays every tooltip reads, defaults filled in. Not exported from the entry point. */
export const TOOLTIP_CONFIG = new InjectionToken<Required<CwTooltipConfig>>('TOOLTIP_CONFIG', {
  providedIn: 'root',
  factory: () => TOOLTIP_DEFAULTS,
});

/** Tooltip sheet of the Design System artifact, "Délais": 700 ms, then 300 ms of skip. */
export const TOOLTIP_DEFAULTS: Required<CwTooltipConfig> = { openDelay: 700, skipDelay: 300 };
