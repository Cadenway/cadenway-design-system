import { InjectionToken } from '@angular/core';

import type { CwTabsConfig } from './tabs.types';

/**
 * Constant TABS_CONFIG
 *
 * @description
 * Internal token for tab defaults provided to descendant tab sets.
 *
 * @type {InjectionToken<CwTabsConfig>}
 */
export const TABS_CONFIG: InjectionToken<CwTabsConfig> = new InjectionToken<CwTabsConfig>(
  'TABS_CONFIG',
);
