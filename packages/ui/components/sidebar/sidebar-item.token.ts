import { InjectionToken } from '@angular/core';

import type { CwSidebarItem } from './sidebar-item/sidebar-item.component';

/**
 * The items of a space, as the space's content query sees them to know whether it holds the
 * current page. Each item provides itself under this token, so the space finds them without
 * importing their class (they import the space's token). Not exported from the entry point.
 */
export const SIDEBAR_ITEM = new InjectionToken<CwSidebarItem>('SIDEBAR_ITEM');
