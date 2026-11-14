import type { ConnectedPosition } from '@angular/cdk/overlay';

import type { CwMenu } from './menu.component';

/**
 * Type CwMenuSide
 *
 * @description
 * Side of the trigger a menu opens on; it flips to the opposite side when there is no room.
 *
 * @type {'top' | 'right' | 'bottom' | 'left'}
 */
export type CwMenuSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * Type CwMenuAlign
 *
 * @description
 * Alignment of a menu along its side; `end` for the `…` button at the end of a row.
 *
 * @type {'start' | 'center' | 'end'}
 */
export type CwMenuAlign = 'start' | 'center' | 'end';

/**
 * Type CwMenuItemVariant
 *
 * @description
 * Look of a menu item; `destructive` comes last, after a separator.
 *
 * @type {'default' | 'destructive'}
 */
export type CwMenuItemVariant = 'default' | 'destructive';

/**
 * Type CwMenuFocus
 *
 * @description
 * Where the focus goes when a menu opens: its `first` or `last` enabled item (keyboard), the `panel` itself (pointer: no item is highlighted until an arrow key or the pointer picks one), or `none` (a submenu opened by hovering its item keeps the focus on that item).
 *
 * @type {'first' | 'last' | 'panel' | 'none'}
 */
export type CwMenuFocus = 'first' | 'last' | 'panel' | 'none';

/**
 * Interface CwMenuPoint
 *
 * @description
 * A point in viewport coordinates, for a menu opened where the pointer is (context menu).
 */
export interface CwMenuPoint {
  // #region Properties
  /**
   * Property x
   *
   * @description
   * Horizontal viewport coordinate in pixels.
   *
   * @type {number}
   * @readonly
   */
  readonly x: number;

  /**
   * Property y
   *
   * @description
   * Vertical viewport coordinate in pixels.
   *
   * @type {number}
   * @readonly
   */
  readonly y: number;
  // #endregion
}

/**
 * Interface CwMenuOpenOptions
 *
 * @description
 * How a trigger opens a `cw-menu`; `[cwMenuTriggerFor]` and `[cwContextMenuTriggerFor]` build it.
 */
export interface CwMenuOpenOptions {
  // #region Properties
  /**
   * Property origin
   *
   * @description
   * What the panel is placed against: the trigger element, or a point (context menu).
   *
   * @type {HTMLElement | CwMenuPoint}
   * @readonly
   */
  readonly origin: HTMLElement | CwMenuPoint;

  /**
   * Property trigger
   *
   * @description
   * The element that opened the menu: it names the panel (it gets a generated id when it has none) and gets the focus back on close.
   *
   * @type {HTMLElement}
   * @readonly
   */
  readonly trigger: HTMLElement;

  /**
   * Property focus
   *
   * @description
   * Where the focus goes once the panel is open; `panel` by default.
   *
   * @type {CwMenuFocus | undefined}
   * @readonly
   */
  readonly focus?: CwMenuFocus;

  /**
   * Property positions
   *
   * @description
   * Positions to try, in order; by default the menu's `side` and `align` and their fallbacks.
   *
   * @type {readonly ConnectedPosition[] | undefined}
   * @readonly
   */
  readonly positions?: readonly ConnectedPosition[];

  /**
   * Property data
   *
   * @description
   * The object the menu acts on (the row, the card), read back through `CwMenu.data()`.
   *
   * @type {unknown}
   * @readonly
   */
  readonly data?: unknown;

  /**
   * Property parent
   *
   * @description
   * The menu this one is a submenu of; set by `[cwMenuTriggerFor]` on a menu item.
   *
   * @type {CwMenu | undefined}
   * @readonly
   */
  readonly parent?: CwMenu;
  // #endregion
}
