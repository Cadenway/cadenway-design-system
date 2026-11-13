import { InjectionToken } from '@angular/core';

import type { CwTabPanel } from './tab-panel/tab-panel.component';

/**
 * The panels of a tab set, as the root's content query sees them. Each panel provides itself under
 * this token, so the root finds them without importing their class (they import the root). Not
 * exported from the entry point.
 */
export const TAB_PANEL = new InjectionToken<CwTabPanel>('TAB_PANEL');
