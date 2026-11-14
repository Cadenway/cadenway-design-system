import { InjectionToken } from '@angular/core';

import type { CwTooltipConfig } from './tooltip.types';

/**
 * Constant TOOLTIP_CONFIG
 *
 * @description
 * Tooltip delays with defaults, available through dependency injection.
 *
 * @type {InjectionToken<Required<CwTooltipConfig>>}
 */
export const TOOLTIP_CONFIG: InjectionToken<Required<CwTooltipConfig>> = new InjectionToken<
  Required<CwTooltipConfig>
>('TOOLTIP_CONFIG', {
  providedIn: 'root',
  factory: () => TOOLTIP_DEFAULTS,
});

/**
 * Constant TOOLTIP_DEFAULTS
 *
 * @description
 * Default open and skip delays in milliseconds.
 *
 * @type {Required<CwTooltipConfig>}
 */
export const TOOLTIP_DEFAULTS: Required<CwTooltipConfig> = { openDelay: 700, skipDelay: 300 };
