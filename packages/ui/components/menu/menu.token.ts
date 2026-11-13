import type { FocusableOption } from '@angular/cdk/a11y';
import { InjectionToken } from '@angular/core';

import type { CwMenu } from './menu.component';

/**
 * What a menu needs from each of its items: the three item kinds provide themselves under
 * `CW_MENU_ITEM`, so `CwMenu` finds them without importing their classes (they import the menu).
 * Not exported from the entry point.
 */
export interface MenuItemHandle extends FocusableOption {
  /** The item's `<button>`. */
  readonly element: HTMLElement;
  /** The menu the item belongs to (the nearest `cw-menu`). */
  readonly menu: CwMenu | null;
  /** Skipped by the arrows and the typeahead, not clickable. */
  readonly disabled: boolean;
  /** The submenu the item opens, when `[cwMenuTriggerFor]` sits on it. */
  submenu(): CwMenu | null;
  focus(): void;
  getLabel(): string;
}

/** The items of a menu, as the menu's content query sees them. */
export const CW_MENU_ITEM = new InjectionToken<MenuItemHandle>('CW_MENU_ITEM');
