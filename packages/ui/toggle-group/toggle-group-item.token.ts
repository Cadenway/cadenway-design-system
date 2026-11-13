import { InjectionToken } from '@angular/core';

import type { CwToggleGroupItem } from './toggle-group-item.component';

/**
 * The items of a toggle group, as the group's content query sees them. Each one provides itself under this token, so the
 * group finds them without importing their class (they import the group). Not exported from the
 * entry point.
 */
export const TOGGLE_GROUP_ITEM = new InjectionToken<CwToggleGroupItem>('TOGGLE_GROUP_ITEM');
