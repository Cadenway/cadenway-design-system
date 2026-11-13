import type { FocusableOption } from '@angular/cdk/a11y';
import { InjectionToken, type Signal } from '@angular/core';

import type { CwToolbarSize } from './toolbar.types';

/**
 * What a toolbar needs from each control of its arrow navigation: `[cwToolbarItem]` and the
 * « Plus » button of `cw-toolbar-overflow` provide themselves under `CW_TOOLBAR_ITEM`, so the
 * toolbar finds them without importing their classes. Not exported from the entry point.
 */
export interface ToolbarItemHandle extends FocusableOption {
  /** The focusable control. */
  readonly element: HTMLElement;
  /** Never moves into the « Plus » menu. */
  readonly pinned: boolean;
  /** Skipped by the arrows: disabled, moved into the « Plus » menu, or not rendered. */
  readonly disabled: boolean;
  /** Whether the control currently sits in the « Plus » menu. */
  readonly overflowed: Signal<boolean>;
  /** Hides the control from the bar (or shows it back), synchronously, for the width measure. */
  setOverflowed(overflowed: boolean): void;
  /** Text of the « Plus » menu entry. */
  menuLabel(): string;
  /** Leading icon of the « Plus » menu entry (an ng-icons name), if any. */
  menuIcon(): string | null;
  /** Runs the control from its « Plus » menu entry. */
  activate(): void;
}

/** What the parts of a toolbar read from it. Not exported from the entry point. */
export interface ToolbarHandle {
  /** The common size of the bar. */
  readonly size: Signal<CwToolbarSize>;
  /** Accessible name of the « Plus » button and its menu. */
  readonly overflowLabel: Signal<string>;
  /** The controls currently in the « Plus » menu, in the order of the bar. */
  readonly overflowItems: Signal<readonly ToolbarItemHandle[]>;
}

/** The toolbar around a part. */
export const CW_TOOLBAR = new InjectionToken<ToolbarHandle>('CW_TOOLBAR');

/** The controls of a toolbar, as the toolbar's content query sees them. */
export const CW_TOOLBAR_ITEM = new InjectionToken<ToolbarItemHandle>('CW_TOOLBAR_ITEM');
