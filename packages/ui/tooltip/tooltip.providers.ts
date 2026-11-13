import type { Provider } from '@angular/core';

import { TOOLTIP_CONFIG, TOOLTIP_DEFAULTS } from './tooltip-config.token';
import type { CwTooltipConfig } from './tooltip.types';

/**
 * Sets the delays of every `[cwTooltip]` below the injector it is provided in (the application, or
 * one component subtree): `openDelay` before the first bubble, `skipDelay` during which the next one
 * opens at once. A missing value keeps its default (700 ms and 300 ms). `cwTooltipOpenDelay` still
 * overrides the open delay of one trigger.
 */
export function provideCwTooltip(config: CwTooltipConfig = {}): Provider {
  return { provide: TOOLTIP_CONFIG, useValue: { ...TOOLTIP_DEFAULTS, ...config } };
}
