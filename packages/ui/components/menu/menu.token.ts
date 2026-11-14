import type { FocusableOption } from '@angular/cdk/a11y';
import { InjectionToken } from '@angular/core';

import type { CwMenu } from './menu.component';

/**
 * Interface MenuItemHandle
 *
 * @description
 * What a menu needs from each of its items: the three item kinds provide themselves under `CW_MENU_ITEM`, so `CwMenu` finds them without importing their classes (they import the menu). Not exported from the entry point.
 */
export interface MenuItemHandle extends FocusableOption {
  // #region Properties
  /**
   * Property element
   *
   * @description
   * The item's `<button>`.
   *
   * @type {HTMLElement}
   * @readonly
   */
  readonly element: HTMLElement;

  /**
   * Property menu
   *
   * @description
   * The menu the item belongs to (the nearest `cw-menu`).
   *
   * @type {CwMenu | null}
   * @readonly
   */
  readonly menu: CwMenu | null;

  /**
   * Property disabled
   *
   * @description
   * Skipped by the arrows and the typeahead, not clickable.
   *
   * @type {boolean}
   * @readonly
   */
  readonly disabled: boolean;
  // #endregion
  // #region Methods
  /**
   * Method submenu
   *
   * @description
   * The submenu the item opens, when `[cwMenuTriggerFor]` sits on it.
   *
   * @returns {CwMenu | null} Submenu opened by the item, or null when absent.
   */
  submenu(): CwMenu | null;

  /**
   * Method focus
   *
   * @description
   * Focuses the menu item.
   */
  focus(): void;

  /**
   * Method getLabel
   *
   * @description
   * Returns the item label for keyboard navigation.
   *
   * @returns {string} Item label used for keyboard navigation.
   */
  getLabel(): string;
  // #endregion
}

/**
 * Constant CW_MENU_ITEM
 *
 * @description
 * The items of a menu, as the menu's content query sees them.
 *
 * @type {InjectionToken<MenuItemHandle>}
 */
export const CW_MENU_ITEM: InjectionToken<MenuItemHandle> = new InjectionToken<MenuItemHandle>(
  'CW_MENU_ITEM',
);
