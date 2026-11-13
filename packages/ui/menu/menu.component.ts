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
} from '@angular/core';
import {
  ɵmenuFrom,
  ɵnavigateList,
  ɵpanelPositions,
  ɵprefersReducedMotion,
} from '@cadenway/ui/core';
import type { Subscription } from 'rxjs';

import { MenuStack } from './menu-stack/menu-stack.service';
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
const PANEL =
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
const SUBMENU_POSITIONS: readonly ConnectedPosition[] = ɵpanelPositions('right', 'start').map(
  (position) => ({
    ...position,
    offsetY: position.overlayY === 'top' ? -5 : position.overlayY === 'bottom' ? 5 : 0,
  }),
);

/* Sheet, "États": a submenu opens after 100 ms of hover. */
const HOVER_DELAY = 100;
const TYPEAHEAD_RESET = 500;
/* The closing animation (`menu-out`, 240 ms) plus a margin, in case `animationend` never comes. */
const CLOSE_FALLBACK = 320;

interface OpenState {
  readonly origin: HTMLElement | CwMenuPoint;
  readonly trigger: HTMLElement;
  readonly data: unknown;
  readonly parent: CwMenu | null;
}

function sideOf(pair: ConnectedPosition): CwMenuSide {
  if (pair.overlayY === 'bottom' && pair.originY === 'top') return 'top';
  if (pair.overlayX === 'start' && pair.originX === 'end') return 'right';
  if (pair.overlayX === 'end' && pair.originX === 'start') return 'left';
  return 'bottom';
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * A menu of actions or options opened from a button (`[cwMenuTriggerFor]`), from a right click
 * (`[cwContextMenuTriggerFor]`) or from another menu's item (submenu): DropdownMenu sheet of the
 * Design System artifact.
 *
 * Holds `button[cwMenuItem]`, `button[cwMenuItemCheckbox]`, `cw-menu-radio-group` with
 * `button[cwMenuItemRadio]`, `cw-menu-group`, `cw-menu-label` and `cw-menu-separator`. The panel
 * (`role="menu"`) renders in a CDK overlay at the body level, placed on `side` and `align` and
 * flipped or shifted to stay visible; its width follows the content (`max-w-sm`), its height is
 * capped to the room left and scrolls. It opens from the trigger's corner (`animate-menu-in`) and
 * closes with `animate-menu-out`, at once under reduced motion. One menu is open at a time.
 *
 * Keyboard: ↓ ↑ in a loop skipping disabled items, Home and End, → opens a submenu, ← closes it,
 * Enter and Space activate, a letter highlights the next item starting with it, Escape closes the
 * current menu and gives the focus back to its trigger, Tab closes every menu. A click outside
 * closes the menus. The pointer and the arrows share one highlight (`data-highlighted`).
 *
 * `inline` renders the panel in place, always open (a menu shown inside a page, the stories); name
 * it with `ariaLabel` then. A panel opened by a trigger is named by that trigger
 * (`aria-labelledby`), or by `ariaLabel` when given. `closed` fires when an opened menu closes.
 */
@Component({
  selector: 'cw-menu',
  imports: [NgTemplateOutlet],
  host: { class: 'contents' },
  templateUrl: './menu.component.html',
})
export class CwMenu {
  /** Side of the trigger the menu opens on; ignored for a submenu (always on the right). */
  readonly side = input<CwMenuSide>('bottom');
  /** Alignment along the side; ignored for a submenu. */
  readonly align = input<CwMenuAlign>('start');
  /** Accessible name of the panel; required when `inline`, else the trigger names it. */
  readonly ariaLabel = input('');
  /** Renders the panel in place, always open, instead of in an overlay opened by a trigger. */
  readonly inline = input(false, { transform: booleanAttribute });
  /** Emitted each time an opened menu closes (item activated, Escape, Tab, outside click). */
  readonly closed = output();

  private readonly ids = inject(_IdGenerator);

  /** Id of the panel, for the trigger's `aria-controls`. */
  readonly panelId = this.ids.getId('cw-menu-');

  private readonly state = signal<OpenState | null>(null);

  /** Whether the menu is open (always false for an `inline` menu). */
  readonly isOpen = computed(() => this.state() !== null);
  /** The element that opened the menu, while it is open. */
  readonly openedBy = computed(() => this.state()?.trigger ?? null);
  /** The object given by the trigger that opened the menu (`cwContextMenuData`), while open. */
  readonly data = computed(() => this.state()?.data);

  /** The highlighted item; the items read it for `data-highlighted`. Not public API. */
  readonly ɵactive = signal<MenuItemHandle | null>(null);

  protected readonly panelClasses = PANEL;
  protected readonly labelledBy = computed(() =>
    this.ariaLabel() ? null : (this.state()?.trigger.id ?? null),
  );

  private readonly template = viewChild.required('panel', { read: TemplateRef });
  private readonly inlinePanel = viewChild<string, ElementRef<HTMLElement>>('panelElement', {
    read: ElementRef,
  });
  private readonly allItems = contentChildren(CW_MENU_ITEM, { descendants: true });
  /* A menu declared inside another menu's content keeps its own items. */
  private readonly items = computed(() => this.allItems().filter((item) => item.menu === this));

  private readonly injector = inject(Injector);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);
  private readonly directionality = inject(Directionality, { optional: true });
  private readonly stack = inject(MenuStack);
  private readonly keyManager = new FocusKeyManager(this.items, this.injector).withWrap();

  private overlayRef: OverlayRef | null = null;
  private panel: HTMLElement | null = null;
  private positionSubscription: Subscription | null = null;
  private child: CwMenu | null = null;
  private hoverTimer: ReturnType<typeof setTimeout> | undefined;
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
  private typed = '';

  constructor() {
    const changes = this.keyManager.change.subscribe(() => {
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

  /**
   * Opens the menu against `options.origin`; triggers call it. A menu already open moves there.
   * Opening a root menu closes any other open menu; opening a submenu closes its open sibling.
   * Does nothing for an `inline` menu.
   */
  open(options: CwMenuOpenOptions): void {
    if (this.inline()) return;
    if (this.state()) this.ɵclose('none');
    // Still running its closing animation: start again from a clean pane.
    if (this.overlayRef?.hasAttached()) this.detach();
    const parent = options.parent ?? null;
    if (parent) parent.adoptChild(this);
    else this.stack.open(this);
    // The panel is named by its trigger (`aria-labelledby`), which therefore needs an id.
    options.trigger.id ||= this.ids.getId('cw-menu-trigger-');
    this.state.set({
      origin: options.origin,
      trigger: options.trigger,
      data: options.data,
      parent,
    });

    const positions = [
      ...(options.positions ??
        (parent ? SUBMENU_POSITIONS : ɵpanelPositions(this.side(), this.align()))),
    ];
    const overlayRef = this.ensureOverlay(this.positionStrategy(options.origin, positions));
    const view = overlayRef.attach(new TemplatePortal(this.template(), this.viewContainerRef));
    view.detectChanges();
    const panel = view.rootNodes.find((node): node is HTMLElement => node instanceof HTMLElement);
    this.panel = panel ?? null;
    if (panel) {
      panel.setAttribute('data-state', 'open');
      // The preferred position until the overlay reports the one it took.
      panel.style.setProperty('--menu-from', ɵmenuFrom(positions[0]));
      panel.setAttribute('data-side', sideOf(positions[0]));
    }
    this.ɵfocus(options.focus ?? 'panel');
  }

  /** Closes the menu and its submenus; the focus goes back to the trigger if it was inside. */
  close(): void {
    this.ɵclose('auto');
  }

  /**
   * Closes the menu and its submenus. `trigger` gives the focus back to the trigger, `auto` only
   * when the focus was inside the menus (an outside click on another control keeps its focus),
   * `none` leaves it. An `inline` menu closes its submenus only. Not public API.
   */
  ɵclose(restore: 'trigger' | 'auto' | 'none'): void {
    const state = this.state();
    if (!state) {
      this.child?.ɵclose(restore);
      return;
    }
    const focusInside = this.containsFocus();
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

  /** Closes the whole chain of menus after an item was activated. Not public API. */
  ɵcloseAll(): void {
    this.root().ɵclose('trigger');
  }

  /** Moves the focus inside the open panel (see `CwMenuFocus`). Not public API. */
  ɵfocus(focus: CwMenuFocus): void {
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

  /** Opens the submenu of `item`, or only moves the focus when it is already open. Not public API. */
  ɵopenSubmenu(item: MenuItemHandle, focus: CwMenuFocus): void {
    const submenu = item.submenu();
    if (!submenu || item.disabled) return;
    clearTimeout(this.hoverTimer);
    if (submenu.openedBy() === item.element) {
      submenu.ɵfocus(focus);
      return;
    }
    submenu.open({ origin: item.element, trigger: item.element, parent: this, focus });
  }

  /**
   * The pointer entered `item`: it takes the highlight (and the focus) at once; after 100 ms
   * another item's submenu closes and the item's own submenu opens. Not public API.
   */
  ɵhover(item: MenuItemHandle): void {
    if (item.disabled) return;
    if (this.keyManager.activeItem !== item) this.keyManager.setActiveItem(item);
    clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(() => {
      if (this.child && this.child.openedBy() !== item.element) this.child.ɵclose('none');
      if (item.submenu()) this.ɵopenSubmenu(item, 'none');
    }, HOVER_DELAY);
  }

  /**
   * An item got the focus (Tab inside an inline menu, a click, a script): the arrows go on from
   * it. Not public API.
   */
  ɵfocused(item: MenuItemHandle): void {
    if (this.keyManager.activeItem === item) return;
    this.keyManager.updateActiveItem(item);
    this.ɵactive.set(item);
  }

  /** The pointer left an item before its submenu opened. Not public API. */
  ɵunhover(): void {
    clearTimeout(this.hoverTimer);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const state = this.state();
    const rtl = this.directionality?.value === 'rtl';
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
        const item = this.keyManager.activeItem;
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

  private typeahead(event: KeyboardEvent): boolean {
    const { key } = event;
    if (key.length !== 1 || key === ' ' || event.ctrlKey || event.metaKey || event.altKey) {
      return false;
    }
    clearTimeout(this.typeaheadTimer);
    this.typed += normalize(key);
    this.typeaheadTimer = setTimeout(() => {
      this.typed = '';
    }, TYPEAHEAD_RESET);
    const items = this.items();
    // A first letter moves past the current item; more letters refine the current match.
    const current = this.keyManager.activeItemIndex ?? -1;
    const from = this.typed.length === 1 ? current + 1 : Math.max(current, 0);
    for (let step = 0; step < items.length; step++) {
      const item = items[(from + step) % items.length];
      if (!item.disabled && normalize(item.getLabel()).startsWith(this.typed)) {
        this.keyManager.setActiveItem(item);
        this.child?.ɵclose('none');
        break;
      }
    }
    return true;
  }

  private positionStrategy(
    origin: HTMLElement | CwMenuPoint,
    positions: ConnectedPosition[],
  ): FlexibleConnectedPositionStrategy {
    const strategy = createFlexibleConnectedPositionStrategy(this.injector, origin)
      .withPositions(positions)
      .withFlexibleDimensions(true)
      .withGrowAfterOpen(false)
      .withPush(false)
      .withViewportMargin(8);
    this.positionSubscription?.unsubscribe();
    this.positionSubscription = strategy.positionChanges.subscribe(({ connectionPair }) => {
      this.applyPosition(connectionPair);
    });
    return strategy;
  }

  private applyPosition(pair: ConnectionPositionPair): void {
    const panel = this.panel;
    if (!panel) return;
    panel.style.setProperty('--menu-from', ɵmenuFrom(pair));
    panel.setAttribute('data-side', sideOf(pair));
  }

  private ensureOverlay(strategy: FlexibleConnectedPositionStrategy): OverlayRef {
    if (this.overlayRef) {
      this.overlayRef.updatePositionStrategy(strategy);
      return this.overlayRef;
    }
    const overlayRef = createOverlayRef(this.injector, {
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

  private onOutsidePointer(event: MouseEvent): void {
    const state = this.state();
    if (!state) return;
    const target = _getEventTarget<Node>(event);
    // A click on the trigger element belongs to the trigger, which toggles the menu itself.
    if (state.origin instanceof HTMLElement && target && state.origin.contains(target)) return;
    for (let ancestor = state.parent; ancestor; ancestor = ancestor.state()?.parent ?? null) {
      if (target && ancestor.panelElement()?.contains(target)) {
        // A click in a parent menu closes this branch only; the clicked item does the rest.
        this.ɵclose('none');
        return;
      }
    }
    this.root().ɵclose('auto');
  }

  private animateOut(): void {
    const panel = this.panel;
    if (!this.overlayRef?.hasAttached() || !panel) return;
    panel.setAttribute('data-state', 'closed');
    let finished = false;
    const onEnd = (event: AnimationEvent): void => {
      if (event.target === panel) finish();
    };
    const finish = (): void => {
      if (finished) return;
      finished = true;
      panel.removeEventListener('animationend', onEnd);
      if (this.panel === panel && !this.state()) this.detach();
    };
    const animation = this.document.defaultView?.getComputedStyle(panel).animationName ?? '';
    if (ɵprefersReducedMotion(this.document) || animation === '' || animation === 'none') {
      finish();
      return;
    }
    panel.addEventListener('animationend', onEnd);
    setTimeout(finish, CLOSE_FALLBACK);
  }

  private detach(): void {
    this.panel = null;
    this.overlayRef?.detach();
  }

  private panelElement(): HTMLElement | null {
    return this.panel ?? this.inlinePanel()?.nativeElement ?? null;
  }

  private containsFocus(): boolean {
    const active = this.document.activeElement;
    if (!active) return false;
    return !!this.panelElement()?.contains(active) || !!this.child?.containsFocus();
  }

  private root(): CwMenu {
    const parent = this.state()?.parent;
    return parent ? parent.root() : this;
  }

  private adoptChild(menu: CwMenu): void {
    if (this.child && this.child !== menu) this.child.ɵclose('none');
    this.child = menu;
  }

  private release(parent: CwMenu | null): void {
    if (parent?.child === this) parent.child = null;
    this.stack.release(this);
  }
}
