import { InjectionToken } from '@angular/core';

import type { CwTabsConfig } from './tabs.types';

/** The defaults `provideCwTabs` gives to the tab sets below it. Not exported from the entry point. */
export const TABS_CONFIG = new InjectionToken<CwTabsConfig>('TABS_CONFIG');
