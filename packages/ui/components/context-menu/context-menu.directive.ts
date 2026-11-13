import type { ConnectedPosition } from '@angular/cdk/overlay';
import {
  DestroyRef,
  Directive,
  ElementRef,
  booleanAttribute,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { OutputRefSubscription } from '@angular/core';
import type { CwMenu, CwMenuFocus, CwMenuPoint } from '@cadenway/ui/components/menu';

/* ContextMenu sheet, "Position": the panel's top-left corner sits on the point, flipped up or left
   when there is no room; no arrow. A point has no size, so only the overlay corner changes. */
const AT_POINT: readonly ConnectedPosition[] = [
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
  { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
];

/* Sheet, "États": a 500 ms long press opens the menu on touch screens. */
const LONG_PRESS = 500;
const LONG_PRESS_SLOP = 8;
/* The browser fires its own `contextmenu` after Shift + F10, the Menu key or a long press: it is
   swallowed for this long so the menu does not reopen at another point. */
const SWALLOW_AFTER_OPEN = 800;

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || !!target.closest('input, textarea, select');
}

/**
 * Opens a `cw-menu` where the user right-clicks a card, a row, a column header or a space: the
 * same actions as the element's `…` menu, faster (ContextMenu sheet of the Design System
 * artifact). The panel and its items come from `@cadenway/ui/components/menu`.
 *
 * A right click opens the menu with its top-left corner on the pointer (flipped up or left
 * without room); a 500 ms long press does the same on touch screens; Shift + F10 and the Menu key
 * open it on the focused element's top-left corner, on the first item. `cwContextMenuData` is the
 * object the menu acts on, read back through the menu's `data()` while it is open. The element
 * keeps its own role; it carries `data-state="open|closed"` (style it
 * `data-[state=open]:bg-selected`) and emits `opened` and `closed`. In an editable field, and when
 * `cwContextMenuDisabled` is set, the browser's own menu stays. Every action of the menu must also
 * exist in a visible menu (WCAG 2.1.1).
 */
@Directive({
  selector: '[cwContextMenuTriggerFor]',
  host: {
    '[attr.data-state]': 'isOpen() ? "open" : "closed"',
    '(contextmenu)': 'onContextMenu($event)',
    '(keydown)': 'onKeydown($event)',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'cancelLongPress()',
    '(pointercancel)': 'cancelLongPress()',
  },
})
export class CwContextMenuTriggerFor {
  /** The menu to open. */
  readonly cwContextMenuTriggerFor = input.required<CwMenu>();
  /** The object the menu acts on (the task), given to the menu's `data()`. */
  readonly cwContextMenuData = input<unknown>();
  /** Leaves the browser's own menu. */
  readonly cwContextMenuDisabled = input(false, { transform: booleanAttribute });
  /** Emitted when the menu opens on this element. */
  readonly opened = output();
  /** Emitted when the menu opened on this element closes. */
  readonly closed = output();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly isOpen = signal(false);
  private closing: OutputRefSubscription | null = null;
  private swallowUntil = 0;
  private longPress: { timer: ReturnType<typeof setTimeout>; x: number; y: number } | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.cancelLongPress();
      this.closing?.unsubscribe();
      if (this.isOpen()) this.cwContextMenuTriggerFor().close();
    });
  }

  protected onContextMenu(event: MouseEvent): void {
    // An inner region already handled it, or the browser's menu stays.
    if (event.defaultPrevented || this.cwContextMenuDisabled() || isEditable(event.target)) return;
    event.preventDefault();
    this.cancelLongPress();
    if (performance.now() < this.swallowUntil) return;
    this.open({ x: event.clientX, y: event.clientY }, this.element, 'panel');
  }

  protected onKeydown(event: KeyboardEvent): void {
    const shortcut = event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey);
    if (!shortcut || event.defaultPrevented || this.cwContextMenuDisabled()) return;
    if (isEditable(event.target)) return;
    event.preventDefault();
    // Sheet, "Clavier": the menu opens on the focused element's top-left corner.
    const focused = event.target instanceof HTMLElement ? event.target : this.element;
    const { left, top } = focused.getBoundingClientRect();
    this.swallowUntil = performance.now() + SWALLOW_AFTER_OPEN;
    this.open({ x: left, y: top }, focused, 'first');
  }

  protected onPointerDown(event: PointerEvent): void {
    this.cancelLongPress();
    if (event.pointerType !== 'touch' || this.cwContextMenuDisabled()) return;
    if (isEditable(event.target)) return;
    const { clientX: x, clientY: y } = event;
    const timer = setTimeout(() => {
      this.longPress = null;
      this.swallowUntil = performance.now() + SWALLOW_AFTER_OPEN;
      this.open({ x, y }, this.element, 'panel');
    }, LONG_PRESS);
    this.longPress = { timer, x, y };
  }

  protected onPointerMove(event: PointerEvent): void {
    const press = this.longPress;
    if (!press) return;
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > LONG_PRESS_SLOP) {
      this.cancelLongPress();
    }
  }

  protected cancelLongPress(): void {
    if (!this.longPress) return;
    clearTimeout(this.longPress.timer);
    this.longPress = null;
  }

  private open(point: CwMenuPoint, trigger: HTMLElement, focus: CwMenuFocus): void {
    const menu = this.cwContextMenuTriggerFor();
    // Opening again (another point, another row) closes the previous session first.
    menu.open({
      origin: point,
      trigger,
      focus,
      positions: AT_POINT,
      data: this.cwContextMenuData(),
    });
    this.isOpen.set(true);
    this.opened.emit();
    this.closing?.unsubscribe();
    this.closing = menu.closed.subscribe(() => {
      this.closing?.unsubscribe();
      this.closing = null;
      this.isOpen.set(false);
      this.closed.emit();
    });
  }
}
