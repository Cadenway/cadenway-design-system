/*
 * Public API of @cadenway/ui/tabs (Tabs sheet of the Design System artifact).
 *
 * Explicit named exports only (.claude/rules/public-api.md).
 */

export { CwTab } from './tab/tab.component';
export { CwTabPanel } from './tab-panel/tab-panel.component';
export { CwTabs } from './tabs.component';
export { CwTabsList } from './tabs-list/tabs-list.component';
export { provideCwTabs } from './tabs.providers';
export type {
  CwTabsActivation,
  CwTabsConfig,
  CwTabsOrientation,
  CwTabsSize,
  CwTabsVariant,
} from './tabs.types';
