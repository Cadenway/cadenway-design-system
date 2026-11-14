import { InjectionToken } from '@angular/core';

import type { CwRadioGroupItem } from './radio-group-item/radio-group-item.component';

/**
 * Constant RADIO_GROUP_ITEM
 *
 * @description
 * The options of a radio group, as its content query sees them. `cw-radio-group-item` provides
 * itself under this token, so the group finds its options without importing their class (the
 * option imports the group). Not exported from the entry point.
 *
 * @type {InjectionToken<CwRadioGroupItem>}
 */
export const RADIO_GROUP_ITEM: InjectionToken<CwRadioGroupItem> =
  new InjectionToken<CwRadioGroupItem>('RADIO_GROUP_ITEM');
