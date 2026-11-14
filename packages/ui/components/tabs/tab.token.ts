import { InjectionToken } from '@angular/core';

import type { CwTab } from './tab/tab.component';

/**
 * Constant TAB
 *
 * @description
 * The tabs of a tab set, as the root's content query sees them. Each tab provides itself under this
 * token, so the root finds them without importing their class (they import the root). Not exported
 * from the entry point.
 *
 * @type {InjectionToken<CwTab>}
 */
export const TAB: InjectionToken<CwTab> = new InjectionToken<CwTab>('TAB');
