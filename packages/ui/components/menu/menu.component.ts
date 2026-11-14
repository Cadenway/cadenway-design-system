import { FocusKeyManager, _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import {
  type ConnectedPosition,
  type ConnectionPositionPair,
  type FlexibleConnectedPositionStrategy,
  type OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import { _getEventTarget } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
  type InputSignalWithTransform,
  type InputSignal,
  type OutputEmitterRef,
  type WritableSignal,
  type Signal,
} from '@angular/core';
import {
  ɵafterExitAnimation,
  ɵfold,
  ɵmenuFrom,
  ɵnavigateList,
  ɵPanelStack,
  ɵpanelPositions,
  type ɵStackedPanel,
} from '@cadenway/ui/core';
import type { Subscription } from 'rxjs';

import { CW_MENU_ITEM, type MenuItemHandle } from './menu.token';
import type {
  CwMenuAlign,
  CwMenuFocus,
  CwMenuOpenOptions,
  CwMenuPoint,
  CwMenuSide,
} from './menu.types';

/* DropdownMenu sheet and preview of the Design System artifact; the width follows the content
   between `min-w-32` and `max-w-sm` (integration guide, "Placement des menus"). The CDK overlay pane
   is a flex box capped to the room left in the viewport: the panel stretches to it and scrolls.
   Items enter with `animate-item-in`, 60 ms then +30 ms, twelve at most (preview). */
/**
 * Constant PANEL
 *
 * @description
 * Classes for the scrollable menu panel and staggered item entrance.
 *
 * @type {string}
 */
const PANEL: string =
  'flex min-h-0 min-w-32 max-w-sm flex-col overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md outline-hidden ' +
  'focus-visible:ring-2 focus-visible:ring-ring ' +
  'animate-menu-in motion-reduce:animate-none data-[state=closed]:pointer-events-none data-[state=closed]:animate-menu-out ' +
  '*:shrink-0 *:animate-item-in *:motion-reduce:animate-none ' +
  '[&>*:nth-child(1)]:[animation-delay:60ms] [&>*:nth-child(2)]:[animation-delay:90ms] [&>*:nth-child(3)]:[animation-delay:120ms] ' +
  '[&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:180ms] [&>*:nth-child(6)]:[animation-delay:210ms] ' +
  '[&>*:nth-child(7)]:[animation-delay:240ms] [&>*:nth-child(8)]:[animation-delay:270ms] [&>*:nth-child(9)]:[animation-delay:300ms] ' +
  '[&>*:nth-child(10)]:[animation-delay:330ms] [&>*:nth-child(11)]:[animation-delay:360ms] [&>*:nth-child(12)]:[animation-delay:390ms]';

/* Submenus open on the right of their item, top edges aligned (the panel's padding and border,
   5 px, sit above its first item), and flip to the left without room (sheet, anatomy 7). */
/**
 * Constant SUBMENU_POSITIONS
 *
 * @description
 * Preferred submenu positions and fallback offsets.
 *
 * @type {readonly ConnectedPosition[]}
 */
const SUBMENU_POSITIONS: readonly ConnectedPosition[] = ɵpanelPositions('right', 'start').map(
  (position) => ({
    ...position,
    offsetY: position.overlayY === 'top' ? -5 : position.overlayY === 'bottom' ? 5 : 0,
  }),
);

/* Sheet, "États": a submenu opens after 100 ms of hover. */
/**
 * Constant HOVER_DELAY
 *
 * @description
 * Delay in milliseconds before opening a hovered submenu.
 *
 * @type {100}
 */
const HOVER_DELAY: 100 = 100;
/**
 * Constant TYPEAHEAD_RESET
 *
 * @description
 * Delay in milliseconds before clearing the typeahead query.
 *
 * @type {500}
 */
const TYPEAHEAD_RESET: 500 = 500;
/* The closing animation (`menu-out`, 240 ms) plus a margin, in case `animationend` never comes. */
/**
 * Constant CLOSE_FALLBACK
 *
 * @description
 * Fallback delay in milliseconds when the exit animation does not finish.
 *
 * @type {320}
 */
const CLOSE_FALLBACK: 320 = 320;

/**
 * Interface OpenState
 *
 * @description
 * Origin, trigger and context retained while a menu is open.
 */
interface OpenState {
  // #region Properties
  /**
   * Property origin
   *
   * @description
   * Element or viewport point against which the menu is positioned.
   *
   * @type {HTMLElement | CwMenuPoint}
   * @readonly
   */
  readonly origin: HTMLElement | CwMenuPoint;

  /**
   * Property trigger
   *
   * @description
   * Element that opened the menu.
   *
   * @type {HTMLElement}
   * @readonly
   */
  readonly trigger: HTMLElement;

  /**
   * Property data
   *
   * @description
   * Consumer context associated with the open menu.
   *
   * @type {unknown}
   * @readonly
   */
  readonly data: unknown;

  /**
   * Property parent
   *
   * @description
   * Parent menu, or null for a root menu.
   *
   * @type {CwMenu | null}
   * @readonly
   */
  readonly parent: CwMenu | null;
  // #endregion
}

/**
 * Function sideOf
 *
 * @description
 * Determines the displayed side from the chosen overlay position.
 *
 * @param {ConnectedPosition} pair - Chosen overlay connection position.
 * @returns {CwMenuSide} Side on which the overlay is displayed.
 */
function sideOf(pair: ConnectedPosition): CwMenuSide {
  if (pair.overlayY === 'bottom' && pair.originY === 'top') return 'top';
  if (pair.overlayX === 'start' && pair.originX === 'end') return 'right';
  if (pair.overlayX === 'end' && pair.originX === 'start') return 'left';
  return 'bottom';
}

/**
 * Component CwMenu
 *
 * @description
 * A menu of actions or options opened from a button (`[cwMenuTriggerFor]`), from a right click (`[cwContextMenuTriggerFor]`) or from another menu's item (submenu): DropdownMenu sheet of the Design System artifact. Holds `button[cwMenuItem]`, `button[cwMenuItemCheckbox]`, `cw-menu-radio-group` with `button[cwMenuItemRadio]`, `cw-menu-group`, `cw-menu-label` and `cw-menu-separator`. The panel (`role="menu"`) renders in a CDK overlay at the body level, placed on `side` and `align` and flipped or shifted to stay visible; its width follows the content (`max-w-sm`), its height is capped to the room left and scrolls. It opens from the trigger's corner (`animate-menu-in`) and closes with `animate-menu-out`, at once under reduced motion. One menu is open at a time, and opening it closes an open select, combobox, popover or date picker unless it sits inside them. Keyboard: ↓ ↑ in a loop skipping disabled items, Home and End, → opens a submenu, ← closes it, Enter and Space activate, a letter highlights the next item starting with it, Escape closes the current menu and gives the focus back to its trigger, Tab closes every menu. A click outside closes the menus. The pointer and the arrows share one highlight (`data-highlighted`). `inline` renders the panel in place, always open (a menu shown inside a page, the stories); name it with `ariaLabel` then. A panel opened by a trigger is named by that trigger (`aria-labelledby`), or by `ariaLabel` when given. `closed` fires when an opened menu closes.
 */
@Component({
  selector: 'cw-menu',
  imports: [NgTemplateOutlet],
  host: { class: 'contents' },
  templateUrl: './menu.component.html',
})
export class CwMenu {
  // #region Properties
  /**
   * Property side
   *
   * @description
   * Side of the trigger the menu opens on; ignored for a submenu (always on the right).
   *
   * @type {InputSignal<CwMenuSide>}
   * @readonly
   */
  public readonly side: InputSignal<CwMenuSide> = input<CwMenuSide>('bottom');

  /**
   * Property align
   *
   * @description
   * Alignment along the side; ignored for a submenu.
   *
   * @type {InputSignal<CwMenuAlign>}
   * @readonly
   */
  public readonly align: InputSignal<CwMenuAlign> = input<CwMenuAlign>('start');

  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name of the panel; required when `inline`, else the trigger names it.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string> = input('');

  /**
   * Property inline
   *
   * @description
   * Renders the panel in place, always open, instead of in an overlay opened by a trigger.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly inline: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property closed
   *
   * @description
   * Emitted each time an opened menu closes (item activated, Escape, Tab, outside click).
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly closed: OutputEmitterRef<void> = output();

  /**
   * Property ids
   *
   * @description
   * Identifier generator for menu panels and triggers.
   *
   * @type {_IdGenerator}
   * @readonly
   */
  private readonly ids: _IdGenerator = inject(_IdGenerator);

  /**
   * Property panelId
   *
   * @description
   * Id of the panel, for the trigger's `aria-controls`.
   *
   * @type {string}
   * @readonly
   */
  public readonly panelId: string = this.ids.getId('cw-menu-');

  /**
   * Property state
   *
   * @description
   * Current open state, or null when closed.
   *
   * @type {WritableSignal<OpenState | null>}
   * @readonly
   */
  private readonly state: WritableSignal<OpenState | null> = signal<OpenState | null>(null);

  /**
   * Property isOpen
   *
   * @description
   * Whether the menu is open (always false for an `inline` menu).
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  public readonly isOpen: Signal<boolean> = computed(() => this.state() !== null);

  /**
   * Property openedBy
   *
   * @description
   * The element that opened the menu, while it is open.
   *
   * @type {Signal<HTMLElement | null>}
   * @readonly
   */
  public readonly openedBy: Signal<HTMLElement | null> = computed(
    () => this.state()?.trigger ?? null,
  );

  /**
   * Property data
   *
   * @description
   * The object given by the trigger that opened the menu (`cwContextMenuData`), while open.
   *
   * @type {Signal<unknown>}
   * @readonly
   */
  public readonly data: Signal<unknown> = computed(() => this.state()?.data);

  /**
   * Property ɵactive
   *
   * @description
   * The highlighted item; the items read it for `data-highlighted`. Not public API.
   *
   * @type {WritableSignal<MenuItemHandle | null>}
   * @readonly
   */
  public readonly ɵactive: WritableSignal<MenuItemHandle | null> = signal<MenuItemHandle | null>(
    null,
  );

  /**
   * Property panelClasses
   *
   * @description
   * Classes applied to the menu panel.
   *
   * @type {string}
   * @readonly
   */
  protected readonly panelClasses: string = PANEL;

  /**
   * Property labelledBy
   *
   * @description
   * Trigger identifier used to label the panel when no explicit label is given.
   *
   * @type {Signal<string | null>}
   * @readonly
   */
  protected readonly labelledBy: Signal<string | null> = computed(() =>
    this.ariaLabel() ? null : (this.state()?.trigger.id ?? null),
  );

  /**
   * Property template
   *
   * @description
   * Template attached to the overlay.
   *
   * @type {Signal<TemplateRef<unknown>>}
   * @readonly
   */
  private readonly template: Signal<TemplateRef<unknown>> = viewChild.required('panel', {
    read: TemplateRef,
  });

  /**
   * Property inlinePanel
   *
   * @description
   * Panel element rendered in inline mode.
   *
   * @type {Signal<ElementRef<HTMLElement> | undefined>}
   * @readonly
   */
  private readonly inlinePanel: Signal<ElementRef<HTMLElement> | undefined> = viewChild<
    string,
    ElementRef<HTMLElement>
  >('panelElement', {
    read: ElementRef,
  });

  /**
   * Property allItems
   *
   * @description
   * Descendant menu items including items from nested menus.
   *
   * @type {Signal<readonly MenuItemHandle[]>}
   * @readonly
   */
  private readonly allItems: Signal<readonly MenuItemHandle[]> = contentChildren(CW_MENU_ITEM, {
    descendants: true,
  });

  /**
   * Property items
   *
   * @description
   * Items owned by this menu, excluding nested menus.
   *
   * @type {Signal<MenuItemHandle[]>}
   * @readonly
   */
  private readonly items: Signal<MenuItemHandle[]> = computed(() =>
    this.allItems().filter((item) => item.menu === this),
  );

  /**
   * Property injector
   *
   * @description
   * Injector used to create overlay strategies.
   *
   * @type {Injector}
   * @readonly
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property viewContainerRef
   *
   * @description
   * Container supplying the overlay template context.
   *
   * @type {ViewContainerRef}
   * @readonly
   */
  private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

  /**
   * Property document
   *
   * @description
   * Document used to inspect the active element.
   *
   * @type {Document}
   * @readonly
   */
  private readonly document: Document = inject(DOCUMENT);

  /**
   * Property directionality
   *
   * @description
   * Optional text direction used for keyboard navigation.
   *
   * @type {Directionality | null}
   * @readonly
   */
  private readonly directionality: Directionality | null = inject(Directionality, {
    optional: true,
  });

  /**
   * Property stack
   *
   * @description
   * Shared stack coordinating floating panels.
   *
   * @type {ɵPanelStack}
   * @readonly
   */
  private readonly stack: ɵPanelStack = inject(ɵPanelStack);

  /**
   * Property stacked
   *
   * @description
   * Root menu entry registered with the shared panel stack.
   *
   * @type {ɵStackedPanel}
   * @readonly
   */
  private readonly stacked: ɵStackedPanel = {
    close: () => {
      this.close();
    },
    contains: (node) => this.holds(node),
  };

  /**
   * Property keyManager
   *
   * @description
   * Focus manager for the menu items.
   *
   * @type {FocusKeyManager<MenuItemHandle>}
   * @readonly
   */
  private readonly keyManager: FocusKeyManager<MenuItemHandle> = new FocusKeyManager(
    this.items,
    this.injector,
  ).withWrap();

  /**
   * Property overlayRef
   *
   * @description
   * Overlay used by this menu, or null before creation.
   *
   * @type {OverlayRef | null}
   */
  private overlayRef: OverlayRef | null = null;

  /**
   * Property panel
   *
   * @description
   * Rendered overlay panel, or null when absent.
   *
   * @type {HTMLElement | null}
   */
  private panel: HTMLElement | null = null;

  /**
   * Property positionSubscription
   *
   * @description
   * Subscription to overlay position changes.
   *
   * @type {Subscription | null}
   */
  private positionSubscription: Subscription | null = null;

  /**
   * Property child
   *
   * @description
   * Open submenu, or null when none is open.
   *
   * @type {CwMenu | null}
   */
  private child: CwMenu | null = null;

  /**
   * Property hoverTimer
   *
   * @description
   * Pending submenu hover timer.
   *
   * @type {ReturnType<typeof setTimeout> | undefined}
   */
  private hoverTimer: ReturnType<typeof setTimeout> | undefined;

  /**
   * Property typeaheadTimer
   *
   * @description
   * Pending timer that clears the typeahead query.
   *
   * @type {ReturnType<typeof setTimeout> | undefined}
   */
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

  /**
   * Property typed
   *
   * @description
   * Accumulated typeahead query.
   *
   * @type {string}
   */
  private typed: string = '';
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Synchronizes active items and cleans up overlay resources on destruction.
   *
   * @constructor
   */
  public constructor() {
    const changes: Subscription = this.keyManager.change.subscribe(() => {
      this.ɵactive.set(this.keyManager.activeItem);
    });
    inject(DestroyRef).onDestroy(() => {
      changes.unsubscribe();
      clearTimeout(this.hoverTimer);
      clearTimeout(this.typeaheadTimer);
      this.positionSubscription?.unsubscribe();
      this.release(this.state()?.parent ?? null);
      // Forget the open state first: disposing detaches the pane, which must not emit `closed`.
      this.state.set(null);
      this.child = null;
      this.overlayRef?.dispose();
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method open
   *
   * @description
   * Opens the menu against `options.origin`; triggers call it. A menu already open moves there. Opening a root menu closes any other open menu; opening a submenu closes its open sibling. Does nothing for an `inline` menu.
   *
   * @param {CwMenuOpenOptions} options - Origin, trigger and opening options for the menu.
   */
  public open(options: CwMenuOpenOptions): void {
    if (this.inline()) return;
    if (this.state()) this.ɵclose('none');
    // Still running its closing animation: start again from a clean pane.
    if (this.overlayRef?.hasAttached()) this.detach();
    const parent: CwMenu | null = options.parent ?? null;
    if (parent) parent.adoptChild(this);
    else this.stack.open(this.stacked, options.trigger);
    // The panel is named by its trigger (`aria-labelledby`), which therefore needs an id.
    options.trigger.id ||= this.ids.getId('cw-menu-trigger-');
    this.state.set({
      origin: options.origin,
      trigger: options.trigger,
      data: options.data,
      parent,
    });

    const positions: ConnectedPosition[] = [
      ...(options.positions ??
        (parent ? SUBMENU_POSITIONS : ɵpanelPositions(this.side(), this.align()))),
    ];
    const overlayRef: OverlayRef = this.ensureOverlay(
      this.positionStrategy(options.origin, positions),
    );
    const view: { rootNodes: unknown[]; detectChanges: () => void } = overlayRef.attach(
      new TemplatePortal(this.template(), this.viewContainerRef),
    );
    view.detectChanges();
    const panel: HTMLElement | undefined = view.rootNodes.find(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );
    this.panel = panel ?? null;
    if (panel) {
      panel.setAttribute('data-state', 'open');
      // The preferred position until the overlay reports the one it took.
      panel.style.setProperty('--menu-from', ɵmenuFrom(positions[0]));
      panel.setAttribute('data-side', sideOf(positions[0]));
    }
    this.ɵfocus(options.focus ?? 'panel');
  }

  /**
   * Method close
   *
   * @description
   * Closes the menu and its submenus; the focus goes back to the trigger if it was inside.
   */
  public close(): void {
    this.ɵclose('auto');
  }

  /**
   * Method ɵclose
   *
   * @description
   * Closes the menu and its submenus. `trigger` gives the focus back to the trigger, `auto` only when the focus was inside the menus (an outside click on another control keeps its focus), `none` leaves it. An `inline` menu closes its submenus only. Not public API.
   *
   * @param {'trigger' | 'auto' | 'none'} restore - Focus restoration behavior when the menu closes.
   */
  public ɵclose(restore: 'trigger' | 'auto' | 'none'): void {
    const state: OpenState | null = this.state();
    if (!state) {
      this.child?.ɵclose(restore);
      return;
    }
    const focusInside: boolean = this.containsFocus();
    this.child?.ɵclose('none');
    clearTimeout(this.hoverTimer);
    this.release(state.parent);
    this.state.set(null);
    this.keyManager.updateActiveItem(-1);
    this.ɵactive.set(null);
    if (restore === 'trigger' || (restore === 'auto' && focusInside)) state.trigger.focus();
    this.animateOut();
    this.closed.emit();
  }

  /**
   * Method ɵcloseAll
   *
   * @description
   * Closes the whole chain of menus after an item was activated. Not public API.
   */
  public ɵcloseAll(): void {
    this.root().ɵclose('trigger');
  }

  /**
   * Method ɵfocus
   *
   * @description
   * Moves the focus inside the open panel (see `CwMenuFocus`). Not public API.
   *
   * @param {CwMenuFocus} focus - Target that receives focus after opening.
   */
  public ɵfocus(focus: CwMenuFocus): void {
    switch (focus) {
      case 'first':
        this.keyManager.setFirstItemActive();
        break;
      case 'last':
        this.keyManager.setLastItemActive();
        break;
      case 'panel':
        this.panelElement()?.focus();
        break;
      case 'none':
        break;
    }
  }

  /**
   * Method ɵopenSubmenu
   *
   * @description
   * Opens the submenu of `item`, or only moves the focus when it is already open. Not public API.
   *
   * @param {MenuItemHandle} item - Menu item involved in the interaction.
   * @param {CwMenuFocus} focus - Target that receives focus after opening.
   */
  public ɵopenSubmenu(item: MenuItemHandle, focus: CwMenuFocus): void {
    const submenu: CwMenu | null = item.submenu();
    if (!submenu || item.disabled) return;
    clearTimeout(this.hoverTimer);
    if (submenu.openedBy() === item.element) {
      submenu.ɵfocus(focus);
      return;
    }
    submenu.open({ origin: item.element, trigger: item.element, parent: this, focus });
  }

  /**
   * Method ɵhover
   *
   * @description
   * The pointer entered `item`: it takes the highlight (and the focus) at once; after 100 ms another item's submenu closes and the item's own submenu opens. Not public API.
   *
   * @param {MenuItemHandle} item - Menu item involved in the interaction.
   */
  public ɵhover(item: MenuItemHandle): void {
    if (item.disabled) return;
    if (this.keyManager.activeItem !== item) this.keyManager.setActiveItem(item);
    clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(() => {
      if (this.child && this.child.openedBy() !== item.element) this.child.ɵclose('none');
      if (item.submenu()) this.ɵopenSubmenu(item, 'none');
    }, HOVER_DELAY);
  }

  /**
   * Method ɵfocused
   *
   * @description
   * An item got the focus (Tab inside an inline menu, a click, a script): the arrows go on from it. Not public API.
   *
   * @param {MenuItemHandle} item - Menu item involved in the interaction.
   */
  public ɵfocused(item: MenuItemHandle): void {
    if (this.keyManager.activeItem === item) return;
    this.keyManager.updateActiveItem(item);
    this.ɵactive.set(item);
  }

  /**
   * Method ɵunhover
   *
   * @description
   * The pointer left an item before its submenu opened. Not public API.
   */
  public ɵunhover(): void {
    clearTimeout(this.hoverTimer);
  }

  /**
   * Method onKeydown
   *
   * @description
   * Handles menu navigation, submenu keys and typeahead.
   *
   * @param {KeyboardEvent} event - Browser event associated with the interaction.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const state: OpenState | null = this.state();
    const rtl: boolean = this.directionality?.value === 'rtl';
    switch (event.key) {
      case 'Escape':
        if (!state) return;
        event.preventDefault();
        // A dialog around the trigger must not close with the menu (integration guide, Dialog).
        event.stopPropagation();
        this.ɵclose('trigger');
        return;
      case 'Tab':
        // The focus returns to the root trigger and the browser moves it on from there.
        if (state) this.root().ɵclose('trigger');
        return;
      case rtl ? 'ArrowLeft' : 'ArrowRight': {
        const item: MenuItemHandle | null = this.keyManager.activeItem;
        if (item?.submenu()) {
          event.preventDefault();
          this.ɵopenSubmenu(item, 'first');
        }
        return;
      }
      case rtl ? 'ArrowRight' : 'ArrowLeft':
        if (state?.parent) {
          event.preventDefault();
          this.ɵclose('trigger');
        }
        return;
    }
    if (ɵnavigateList(this.keyManager, event, 'vertical', rtl)) {
      event.preventDefault();
      this.child?.ɵclose('none');
      return;
    }
    if (this.typeahead(event)) event.preventDefault();
  }

  /**
   * Method typeahead
   *
   * @description
   * Moves the active item to a matching label for a typed character.
   *
   * @param {KeyboardEvent} event - Browser event associated with the interaction.
   * @returns {boolean} Whether the key was handled as typeahead.
   */
  private typeahead(event: KeyboardEvent): boolean {
    const { key }: KeyboardEvent = event;
    if (key.length !== 1 || key === ' ' || event.ctrlKey || event.metaKey || event.altKey) {
      return false;
    }
    clearTimeout(this.typeaheadTimer);
    this.typed += ɵfold(key);
    this.typeaheadTimer = setTimeout(() => {
      this.typed = '';
    }, TYPEAHEAD_RESET);
    const items: MenuItemHandle[] = this.items();
    // A first letter moves past the current item; more letters refine the current match.
    const current: number = this.keyManager.activeItemIndex ?? -1;
    const from: number = this.typed.length === 1 ? current + 1 : Math.max(current, 0);
    for (let step: number = 0; step < items.length; step++) {
      const item: MenuItemHandle = items[(from + step) % items.length];
      if (!item.disabled && ɵfold(item.getLabel()).startsWith(this.typed)) {
        this.keyManager.setActiveItem(item);
        this.child?.ɵclose('none');
        break;
      }
    }
    return true;
  }

  /**
   * Method positionStrategy
   *
   * @description
   * Creates a connected position strategy and observes its chosen position.
   *
   * @param {HTMLElement | CwMenuPoint} origin - Element or viewport point used as overlay origin.
   * @param {ConnectedPosition[]} positions - Overlay positions to try in order.
   * @returns {FlexibleConnectedPositionStrategy} Configured connected overlay strategy.
   */
  private positionStrategy(
    origin: HTMLElement | CwMenuPoint,
    positions: ConnectedPosition[],
  ): FlexibleConnectedPositionStrategy {
    const strategy: FlexibleConnectedPositionStrategy = createFlexibleConnectedPositionStrategy(
      this.injector,
      origin,
    )
      .withPositions(positions)
      .withFlexibleDimensions(true)
      .withGrowAfterOpen(false)
      .withPush(false)
      .withViewportMargin(8);
    this.positionSubscription?.unsubscribe();
    this.positionSubscription = strategy.positionChanges.subscribe(
      ({ connectionPair }: { connectionPair: ConnectionPositionPair }) => {
        this.applyPosition(connectionPair);
      },
    );
    return strategy;
  }

  /**
   * Method applyPosition
   *
   * @description
   * Updates the panel side and animation origin for the chosen position.
   *
   * @param {ConnectionPositionPair} pair - Chosen overlay connection position.
   */
  private applyPosition(pair: ConnectionPositionPair): void {
    const panel: HTMLElement | null = this.panel;
    if (!panel) return;
    panel.style.setProperty('--menu-from', ɵmenuFrom(pair));
    panel.setAttribute('data-side', sideOf(pair));
  }

  /**
   * Method ensureOverlay
   *
   * @description
   * Creates or updates the overlay for the supplied position strategy.
   *
   * @param {FlexibleConnectedPositionStrategy} strategy - Position strategy to apply to the overlay.
   * @returns {OverlayRef} Overlay using the requested position strategy.
   */
  private ensureOverlay(strategy: FlexibleConnectedPositionStrategy): OverlayRef {
    if (this.overlayRef) {
      this.overlayRef.updatePositionStrategy(strategy);
      return this.overlayRef;
    }
    const overlayRef: OverlayRef = createOverlayRef(this.injector, {
      positionStrategy: strategy,
      scrollStrategy: createRepositionScrollStrategy(this.injector),
      direction: this.directionality?.value ?? 'ltr',
      disposeOnNavigation: true,
    });
    overlayRef.outsidePointerEvents().subscribe((event) => {
      this.onOutsidePointer(event);
    });
    overlayRef.detachments().subscribe(() => {
      // Detached from outside (navigation): forget the open state.
      if (this.state()) this.ɵclose('none');
      this.panel = null;
    });
    this.overlayRef = overlayRef;
    return overlayRef;
  }

  /**
   * Method onOutsidePointer
   *
   * @description
   * Closes the appropriate menu branch for an outside pointer event.
   *
   * @param {MouseEvent} event - Browser event associated with the interaction.
   */
  private onOutsidePointer(event: MouseEvent): void {
    const state: OpenState | null = this.state();
    if (!state) return;
    const target: Node | null = _getEventTarget<Node>(event);
    // A click on the trigger element belongs to the trigger, which toggles the menu itself.
    if (state.origin instanceof HTMLElement && target && state.origin.contains(target)) return;
    for (
      let ancestor: CwMenu | null = state.parent;
      ancestor;
      ancestor = ancestor.state()?.parent ?? null
    ) {
      if (target && ancestor.panelElement()?.contains(target)) {
        // A click in a parent menu closes this branch only; the clicked item does the rest.
        this.ɵclose('none');
        return;
      }
    }
    this.root().ɵclose('auto');
  }

  /**
   * Method animateOut
   *
   * @description
   * Starts the exit animation and detaches the panel when it finishes.
   */
  private animateOut(): void {
    const panel: HTMLElement | null = this.panel;
    if (!this.overlayRef?.hasAttached() || !panel) return;
    panel.setAttribute('data-state', 'closed');
    // Detached unless the menu reopened meanwhile (a new panel, or the same one open again).
    ɵafterExitAnimation(
      panel,
      () => {
        if (this.panel === panel && !this.state()) this.detach();
      },
      { fallback: CLOSE_FALLBACK },
    );
  }

  /**
   * Method detach
   *
   * @description
   * Detaches the overlay panel.
   */
  private detach(): void {
    this.panel = null;
    this.overlayRef?.detach();
  }

  /**
   * Method panelElement
   *
   * @description
   * Returns the overlay or inline panel element.
   * @returns {HTMLElement | null} Current panel element, or null when absent.
   */
  private panelElement(): HTMLElement | null {
    return this.panel ?? this.inlinePanel()?.nativeElement ?? null;
  }

  /**
   * Method containsFocus
   *
   * @description
   * Checks whether focus is inside this menu or an open submenu.
   * @returns {boolean} Whether focus is inside the open menu chain.
   */
  private containsFocus(): boolean {
    const active: Element | null = this.document.activeElement;
    if (!active) return false;
    return !!this.panelElement()?.contains(active) || !!this.child?.containsFocus();
  }

  /**
   * Method holds
   *
   * @description
   * Whether `node` is in this menu's panel or in one of its open submenus.
   *
   * @param {Node} node - Node to check against the open menu chain.
   * @returns {boolean} Whether the node is inside this menu or an open submenu.
   */
  private holds(node: Node): boolean {
    return !!this.panelElement()?.contains(node) || !!this.child?.holds(node);
  }

  /**
   * Method root
   *
   * @description
   * Finds the root menu in the current chain.
   * @returns {CwMenu} Root menu of the current chain.
   */
  private root(): CwMenu {
    const parent: CwMenu | null | undefined = this.state()?.parent;
    return parent ? parent.root() : this;
  }

  /**
   * Method adoptChild
   *
   * @description
   * Closes an existing sibling and records the open submenu.
   *
   * @param {CwMenu} menu - Submenu to register as the active child.
   */
  private adoptChild(menu: CwMenu): void {
    if (this.child && this.child !== menu) this.child.ɵclose('none');
    this.child = menu;
  }

  /**
   * Method release
   *
   * @description
   * Releases this menu from its parent and the shared panel stack.
   *
   * @param {CwMenu | null} parent - Parent menu to release, or null for a root menu.
   */
  private release(parent: CwMenu | null): void {
    if (parent?.child === this) parent.child = null;
    this.stack.release(this.stacked);
  }
  // #endregion
}
