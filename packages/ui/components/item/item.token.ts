import { InjectionToken } from '@angular/core';

import type { CwItem } from './item.component';

/**
 * Constant ITEM_GROUP_ITEM
 *
 * @description
 * The rows of an item group, as the group's content query sees them. Each one provides itself under this token, so the
 * group finds them without importing their class (they import the group). Not exported from the
 * entry point.
 *
 * @type {InjectionToken<CwItem>}
 */
export const ITEM_GROUP_ITEM: InjectionToken<CwItem> = new InjectionToken<CwItem>(
  'ITEM_GROUP_ITEM',
);
