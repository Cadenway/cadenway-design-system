import {
  createGlobalPositionStrategy,
  type GlobalPositionStrategy,
  type OverlayRef,
  type PositionStrategy,
} from '@angular/cdk/overlay';
import { DOCUMENT, InjectionToken, type Injector, type Provider } from '@angular/core';

/**
 * Interface CwPhoneSheetConfig
 *
 * @description
 * Where the menus, popovers, selects and comboboxes sit when they open as a sheet on a phone.
 */
export interface CwPhoneSheetConfig {
  // #region Properties
  /**
   * Property bottom
   * @readonly
   *
   * @description
   * Distance between the sheet and the bottom of the screen, in px: 64 by default, which keeps the
   * 56 px tab bar of `nav[cwAppRail]` and 8 px visible (mockup `App.dc.html`, `max-md:bottom-16`).
   *
   * @type {number | undefined}
   */
  readonly bottom?: number;

  /**
   * Property gutter
   * @readonly
   *
   * @description
   * Margin on the left and the right of the sheet, in px: 8 by default (mockup `max-md:inset-x-2`).
   *
   * @type {number | undefined}
   */
  readonly gutter?: number;
  // #endregion
}

/**
 * Interface ɵPhoneSheet
 *
 * @description
 * How an overlay brick presents its panel as a phone sheet: the pane's position, and the size the
 * brick gives its overlay (`width`, `maxHeight` of `createOverlayRef` or `updateSize`). Shared
 * across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export interface ɵPhoneSheet {
  // #region Properties
  /**
   * Property strategy
   * @readonly
   *
   * @description
   * Position strategy docking the pane above the bottom of the screen, between the gutters; its
   * native popover is inserted right after the trigger, so the panel keeps the trigger's theme
   * scope and its place in the tab order.
   *
   * @type {PositionStrategy}
   */
  readonly strategy: PositionStrategy;

  /**
   * Property width
   * @readonly
   *
   * @description
   * Width of the pane, the screen minus the two gutters; the panel fills it.
   *
   * @type {string}
   */
  readonly width: string;

  /**
   * Property maxHeight
   * @readonly
   *
   * @description
   * Maximum height of the pane, which keeps the gutter free at the top of the screen; the panel
   * scrolls past it.
   *
   * @type {string}
   */
  readonly maxHeight: string;

  /**
   * Property menuFrom
   * @readonly
   *
   * @description
   * `--menu-from` value revealing the panel from its bottom left corner (mockup `menu-from-bl`).
   *
   * @type {string}
   */
  readonly menuFrom: string;
  // #endregion
}

/**
 * Class DockedStrategy
 * @class DockedStrategy
 *
 * @description
 * Places the pane with a global strategy (docked to the viewport) while inserting its native
 * popover after an anchor, as the connected strategies' `inline` location does: the CDK reads
 * `getPopoverInsertionPoint` when it creates and reattaches the overlay host.
 */
class DockedStrategy implements PositionStrategy {
  // #region Properties
  /**
   * Property global
   * @readonly
   *
   * @description
   * Strategy computing the docked position.
   *
   * @type {GlobalPositionStrategy}
   */
  private readonly global: GlobalPositionStrategy;

  /**
   * Property anchor
   * @readonly
   *
   * @description
   * Element the overlay host is inserted after, or null for the overlay container.
   *
   * @type {Element | null}
   */
  private readonly anchor: Element | null;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Wraps the docked position and remembers where the host goes.
   *
   * @param {GlobalPositionStrategy} global - Strategy computing the docked position.
   * @param {Element | null} anchor - Element the host follows in the document.
   * @constructor
   */
  public constructor(global: GlobalPositionStrategy, anchor: Element | null) {
    this.global = global;
    this.anchor = anchor;
  }
  // #endregion

  // #region Methods
  /**
   * Method attach
   *
   * @description
   * Attaches the docked position to the overlay.
   *
   * @param {OverlayRef} overlayRef - Overlay being positioned.
   */
  public attach(overlayRef: OverlayRef): void {
    this.global.attach(overlayRef);
  }

  /**
   * Method apply
   *
   * @description
   * Applies the docked position.
   */
  public apply(): void {
    this.global.apply();
  }

  /**
   * Method dispose
   *
   * @description
   * Removes the docked position's styles.
   */
  public dispose(): void {
    this.global.dispose();
  }

  /**
   * Method getPopoverInsertionPoint
   *
   * @description
   * Tells the CDK to insert the overlay host after the anchor.
   *
   * @returns {Element | null} The anchor, or null for the overlay container.
   */
  public getPopoverInsertionPoint(): Element | null {
    return this.anchor;
  }
  // #endregion
}

/**
 * Constant PHONE
 *
 * @description
 * Media query of the phone layout, the breakpoint of the bricks' `max-md:` classes.
 *
 * @type {string}
 */
const PHONE: string = '(max-width: 767.98px)';

/**
 * Constant ɵPHONE_SHEET
 *
 * @description
 * Phone sheet placement given by `provideCwPhoneSheets`, or null when the application did not opt
 * in: the overlay bricks then keep their panels next to their triggers on every screen. Shared
 * across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @type {InjectionToken<Required<CwPhoneSheetConfig> | null>}
 */
export const ɵPHONE_SHEET: InjectionToken<Required<CwPhoneSheetConfig> | null> =
  new InjectionToken<Required<CwPhoneSheetConfig> | null>('PHONE_SHEET', {
    providedIn: 'root',
    factory: () => null,
  });

/**
 * Function provideCwPhoneSheets
 *
 * @description
 * Opts an application (or a component subtree) into phone sheets: below 768 px, `cw-menu`,
 * `cw-popover`, `cw-select` and `cw-combobox` open their panel docked at the bottom of the screen,
 * full width between two gutters, instead of next to their trigger (mockup `App.dc.html`: the menus
 * of the rail, `max-md:fixed max-md:inset-x-2 max-md:bottom-16`). The choice is made each time a
 * panel opens; keyboard, focus, tab order, theme scope, Escape and outside clicks are unchanged
 * (the panel stays a native popover inserted after its trigger). Without this provider the bricks
 * behave as before on every screen.
 *
 * @param {CwPhoneSheetConfig} [config] - Bottom offset and gutters, in px.
 *
 * @returns {Provider} Provider enabling the phone sheet placement.
 */
export function provideCwPhoneSheets(config: CwPhoneSheetConfig = {}): Provider {
  return { provide: ɵPHONE_SHEET, useValue: { bottom: 64, gutter: 8, ...config } };
}

/**
 * Function ɵphoneSheet
 *
 * @description
 * Returns the phone sheet placement when the application opted in and the screen is a phone's, or
 * null to keep the panel next to its trigger. False where media queries do not exist (server
 * rendering, test DOMs). Shared across the entry points of `@cadenway/ui`; not public API (`ɵ`
 * prefix).
 *
 * @param {Injector} injector - Injector of the brick opening a panel.
 * @param {Element | null} anchor - Trigger the panel's native popover follows in the document, or
 * null to attach it to the overlay container.
 *
 * @returns {ɵPhoneSheet | null} The sheet placement, or null.
 */
export function ɵphoneSheet(injector: Injector, anchor: Element | null): ɵPhoneSheet | null {
  const config: Required<CwPhoneSheetConfig> | null = injector.get(ɵPHONE_SHEET);
  if (!config) return null;
  const view: Window | null = injector.get(DOCUMENT).defaultView;
  if (typeof view?.matchMedia !== 'function' || !view.matchMedia(PHONE).matches) return null;
  const bottom: number = config.bottom;
  const gutter: number = config.gutter;
  return {
    strategy: new DockedStrategy(
      createGlobalPositionStrategy(injector)
        .left(`${String(gutter)}px`)
        .bottom(`${String(bottom)}px`),
      anchor,
    ),
    width: `calc(100% - ${String(gutter * 2)}px)`,
    maxHeight: `calc(100dvh - ${String(bottom + gutter)}px)`,
    menuFrom: 'inset(calc(100% - 16px) calc(100% - 16px) 0 0 round 10px)',
  };
}
