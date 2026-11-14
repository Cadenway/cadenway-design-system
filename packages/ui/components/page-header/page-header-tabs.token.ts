import { InjectionToken } from '@angular/core';

import type { CwPageHeaderTabs } from './page-header-tabs/page-header-tabs.component';

/**
 * Constant PAGE_HEADER_TABS
 *
 * @description
 * The view tabs of a page header, as the header's content query sees them. The tabs part provides
 * itself under this token, so the header finds it without importing its class (it imports the
 * header). Not exported from the entry point.
 *
 * @type {InjectionToken<CwPageHeaderTabs>}
 */
export const PAGE_HEADER_TABS: InjectionToken<CwPageHeaderTabs> =
  new InjectionToken<CwPageHeaderTabs>('PAGE_HEADER_TABS');
