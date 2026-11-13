import { InjectionToken } from '@angular/core';

import type { CwRadioGroupItem } from './radio-group-item.component';

/**
 * The options of a radio group, as its content query sees them. `cw-radio-group-item` provides
 * itself under this token, so the group finds its options without importing their class (the
 * option imports the group). Not exported from the entry point.
 */
export const RADIO_GROUP_ITEM = new InjectionToken<CwRadioGroupItem>('RADIO_GROUP_ITEM');
