import type { FocusableOption } from '@angular/cdk/a11y';
import { InjectionToken, type Signal } from '@angular/core';

import type { CwToolbarSize } from './toolbar.types';

/**
 * Interface ToolbarItemHandle
 *
 * @description
 * What a toolbar needs from each control of its arrow navigation: `[cwToolbarItem]` and the
 * « Plus » button of `cw-toolbar-overflow` provide themselves under `CW_TOOLBAR_ITEM`, so the
 * toolbar finds them without importing their classes. Not exported from the entry point.
 */
export interface ToolbarItemHandle extends FocusableOption {
  // #region Properties
  /**
   * Property element
   * @readonly
   *
   * @description
   * The focusable control.
   *
   * @type {HTMLElement}
   */
  readonly element: HTMLElement;

  /**
   * Property pinned
   * @readonly
   *
   * @description
   * Never moves into the « Plus » menu.
   *
   * @type {boolean}
   */
  readonly pinned: boolean;

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Skipped by the arrows: disabled, moved into the « Plus » menu, or not rendered.
   *
   * @type {boolean}
   */
  readonly disabled: boolean;

  /**
   * Property overflowed
   * @readonly
   *
   * @description
   * Whether the control currently sits in the « Plus » menu.
   *
   * @type {Signal<boolean>}
   */
  readonly overflowed: Signal<boolean>;
  // #endregion

  // #region Methods
  /**
   * Method setOverflowed
   *
   * @description
   * Hides the control from the bar (or shows it back), synchronously, for the width measure.
   *
   * @param {boolean} overflowed - Whether the control should be hidden for overflow measurement.
   */
  setOverflowed(overflowed: boolean): void;

  /**
   * Method menuLabel
   *
   * @description
   * Text of the « Plus » menu entry.
   *
   * @returns {string} Text used for the overflow menu entry.
   */
  menuLabel(): string;

  /**
   * Method menuIcon
   *
   * @description
   * Leading icon of the « Plus » menu entry (an ng-icons name), if any.
   *
   * @returns {string | null} Leading icon name, or null when absent.
   */
  menuIcon(): string | null;

  /**
   * Method activate
   *
   * @description
   * Runs the control from its « Plus » menu entry.
   */
  activate(): void;
  // #endregion
}

/**
 * Interface ToolbarHandle
 *
 * @description
 * Internal toolbar contract consumed by its parts.
 */
export interface ToolbarHandle {
  // #region Properties
  /**
   * Property size
   * @readonly
   *
   * @description
   * The common size of the bar.
   *
   * @type {Signal<CwToolbarSize>}
   */
  readonly size: Signal<CwToolbarSize>;

  /**
   * Property overflowLabel
   * @readonly
   *
   * @description
   * Accessible name of the « Plus » button and its menu.
   *
   * @type {Signal<string>}
   */
  readonly overflowLabel: Signal<string>;

  /**
   * Property overflowItems
   * @readonly
   *
   * @description
   * The controls currently in the « Plus » menu, in the order of the bar.
   *
   * @type {Signal<readonly ToolbarItemHandle[]>}
   */
  readonly overflowItems: Signal<readonly ToolbarItemHandle[]>;
  // #endregion
}

/**
 * Constant CW_TOOLBAR
 *
 * @description
 * Internal token for the containing toolbar.
 *
 * @type {InjectionToken<ToolbarHandle>}
 */
export const CW_TOOLBAR: InjectionToken<ToolbarHandle> = new InjectionToken<ToolbarHandle>(
  'CW_TOOLBAR',
);

/**
 * Constant CW_TOOLBAR_ITEM
 *
 * @description
 * Internal token for toolbar navigation controls.
 *
 * @type {InjectionToken<ToolbarItemHandle>}
 */
export const CW_TOOLBAR_ITEM: InjectionToken<ToolbarItemHandle> =
  new InjectionToken<ToolbarItemHandle>('CW_TOOLBAR_ITEM');
