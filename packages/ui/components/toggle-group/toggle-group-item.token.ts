import { InjectionToken } from '@angular/core';

import type { CwToggleGroupItem } from './toggle-group-item/toggle-group-item.component';

/**
 * Constant TOGGLE_GROUP_ITEM
 *
 * @description
 * The items of a toggle group, as the group's content query sees them. Each one provides itself under this token, so the
 * group finds them without importing their class (they import the group). Not exported from the
 * entry point.
 *
 * @type {InjectionToken<CwToggleGroupItem>}
 */
export const TOGGLE_GROUP_ITEM: InjectionToken<CwToggleGroupItem> =
  new InjectionToken<CwToggleGroupItem>('TOGGLE_GROUP_ITEM');
