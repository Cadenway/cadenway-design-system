import type { Provider } from '@angular/core';

import { TABS_CONFIG } from './tabs-config.token';
import type { CwTabsConfig } from './tabs.types';

/**
 * Function provideCwTabs
 *
 * @description
 * Sets the default `variant` and `size` of every `cw-tabs` below the injector it is provided in (a
 * component subtree, usually). A tab set that binds the input still wins. `cw-page-header-tabs`
 * provides `{ variant: 'bar' }`: the views of a page header are underlined tabs (Page Header sheet
 * of the Design System artifact, "Onglets de vues").
 *
 * @param {CwTabsConfig} config - Default variant and size for the injector subtree.
 *
 * @returns {Provider} Provider supplying those defaults.
 */
export function provideCwTabs(config: CwTabsConfig): Provider {
  return { provide: TABS_CONFIG, useValue: config };
}
