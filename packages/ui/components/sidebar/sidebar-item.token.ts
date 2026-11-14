import { InjectionToken } from '@angular/core';

import type { CwSidebarItem } from './sidebar-item/sidebar-item.component';

/**
 * Constant SIDEBAR_ITEM
 *
 * @description
 * The items of a space, as the space's content query sees them to know whether it holds the
 * current page. Each item provides itself under this token, so the space finds them without
 * importing their class (they import the space's token). Not exported from the entry point.
 *
 * @type {InjectionToken<CwSidebarItem>}
 */
export const SIDEBAR_ITEM: InjectionToken<CwSidebarItem> = new InjectionToken<CwSidebarItem>(
  'SIDEBAR_ITEM',
);
