import { InjectionToken } from '@angular/core';

import type { CwItem } from './item.component';

/**
 * The rows of an item group, as the group's content query sees them. Each one provides itself under this token, so the
 * group finds them without importing their class (they import the group). Not exported from the
 * entry point.
 */
export const ITEM_GROUP_ITEM = new InjectionToken<CwItem>('ITEM_GROUP_ITEM');
