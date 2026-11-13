import type { ConnectedPosition } from '@angular/cdk/overlay';

import type { CwMenu } from './menu.component';

/** Side of the trigger a menu opens on; it flips to the opposite side when there is no room. */
export type CwMenuSide = 'top' | 'right' | 'bottom' | 'left';

/** Alignment of a menu along its side; `end` for the `…` button at the end of a row. */
export type CwMenuAlign = 'start' | 'center' | 'end';

/** Look of a menu item; `destructive` comes last, after a separator. */
export type CwMenuItemVariant = 'default' | 'destructive';

/**
 * Where the focus goes when a menu opens: its `first` or `last` enabled item (keyboard), the
 * `panel` itself (pointer: no item is highlighted until an arrow key or the pointer picks one), or
 * `none` (a submenu opened by hovering its item keeps the focus on that item).
 */
export type CwMenuFocus = 'first' | 'last' | 'panel' | 'none';

/** A point in viewport coordinates, for a menu opened where the pointer is (context menu). */
export interface CwMenuPoint {
  readonly x: number;
  readonly y: number;
}

/** How a trigger opens a `cw-menu`; `[cwMenuTriggerFor]` and `[cwContextMenuTriggerFor]` build it. */
export interface CwMenuOpenOptions {
  /** What the panel is placed against: the trigger element, or a point (context menu). */
  readonly origin: HTMLElement | CwMenuPoint;
  /**
   * The element that opened the menu: it names the panel (it gets a generated id when it has
   * none) and gets the focus back on close.
   */
  readonly trigger: HTMLElement;
  /** Where the focus goes once the panel is open; `panel` by default. */
  readonly focus?: CwMenuFocus;
  /** Positions to try, in order; by default the menu's `side` and `align` and their fallbacks. */
  readonly positions?: readonly ConnectedPosition[];
  /** The object the menu acts on (the row, the card), read back through `CwMenu.data()`. */
  readonly data?: unknown;
  /** The menu this one is a submenu of; set by `[cwMenuTriggerFor]` on a menu item. */
  readonly parent?: CwMenu;
}
