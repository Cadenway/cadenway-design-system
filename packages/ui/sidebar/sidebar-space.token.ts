import { InjectionToken } from '@angular/core';

import type { CwSidebarSpace } from './sidebar-space/sidebar-space.component';

/**
 * The space an item sits in, which makes it a 28 px sub-item. The space provides itself under this
 * token, so the item finds it without importing its class (the space imports the item's token).
 * Not exported from the entry point.
 */
export const SIDEBAR_SPACE = new InjectionToken<CwSidebarSpace>('SIDEBAR_SPACE');
