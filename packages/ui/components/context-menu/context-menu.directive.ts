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
  type InputSignal,
  type InputSignalWithTransform,
  type OutputEmitterRef,
  type WritableSignal,
} from '@angular/core';
import type { OutputRefSubscription } from '@angular/core';
import type { CwMenu, CwMenuFocus, CwMenuPoint } from '@cadenway/ui/components/menu';

/* ContextMenu sheet, "Position": the panel's top-left corner sits on the point, flipped up or left
   when there is no room; no arrow. A point has no size, so only the overlay corner changes. */
/**
 * Constant AT_POINT
 *
 * @description
 * Overlay positions anchored to the pointer location.
 *
 * @type {readonly ConnectedPosition[]}
 */
const AT_POINT: readonly ConnectedPosition[] = [
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
  { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
];

/* Sheet, "États": a 500 ms long press opens the menu on touch screens. */
/**
 * Constant LONG_PRESS
 *
 * @description
 * Touch hold duration in milliseconds.
 *
 * @type {number}
 */
const LONG_PRESS: number = 500;
/**
 * Constant LONG_PRESS_SLOP
 *
 * @description
 * Maximum touch movement before cancelling a long press.
 *
 * @type {number}
 */
const LONG_PRESS_SLOP: number = 8;
/* The browser fires its own `contextmenu` after Shift + F10, the Menu key or a long press: it is
   swallowed for this long so the menu does not reopen at another point. */
/**
 * Constant SWALLOW_AFTER_OPEN
 *
 * @description
 * Interval for suppressing the subsequent native context menu.
 *
 * @type {number}
 */
const SWALLOW_AFTER_OPEN: number = 800;

/**
 * Function isEditable
 *
 * @description
 * Reports whether the target belongs to an editable field.
 *
 * @param {EventTarget | null} target - Event target to inspect for an editable ancestor.
 *
 * @returns {boolean} Whether the target is an editable field or belongs to one.
 */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || !!target.closest('input, textarea, select');
}

/**
 * Directive CwContextMenuTriggerFor
 *
 * @description
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
  // #region Properties
  /**
   * Property cwContextMenuTriggerFor
   * @readonly
   *
   * @description
   * Menu opened by the trigger.
   *
   * @type {InputSignal<CwMenu>}
   */
  public readonly cwContextMenuTriggerFor: InputSignal<CwMenu> = input.required<CwMenu>();

  /**
   * Property cwContextMenuData
   * @readonly
   *
   * @description
   * Data supplied to the menu when opened.
   *
   * @type {InputSignal<unknown>}
   */
  public readonly cwContextMenuData: InputSignal<unknown> = input<unknown>();

  /**
   * Property cwContextMenuDisabled
   * @readonly
   *
   * @description
   * Whether the browser context menu is retained.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly cwContextMenuDisabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property opened
   * @readonly
   *
   * @description
   * Emits when this trigger opens the menu.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly opened: OutputEmitterRef<void> = output();

  /**
   * Property closed
   * @readonly
   *
   * @description
   * Emits when the menu opened by this trigger closes.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly closed: OutputEmitterRef<void> = output();

  /**
   * Property element
   * @readonly
   *
   * @description
   * Trigger host element.
   *
   * @type {HTMLElement}
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property isOpen
   * @readonly
   *
   * @description
   * Whether this trigger currently owns an open menu.
   *
   * @type {WritableSignal<boolean>}
   */
  protected readonly isOpen: WritableSignal<boolean> = signal(false);

  /**
   * Property closing
   *
   * @description
   * Subscription to the current menu close event.
   *
   * @type {OutputRefSubscription | null}
   */
  private closing: OutputRefSubscription | null = null;

  /**
   * Property swallowUntil
   *
   * @description
   * Deadline for suppressing native context menu events.
   *
   * @type {number}
   */
  private swallowUntil: number = 0;

  /**
   * Property longPress
   *
   * @description
   * Pending touch hold and its origin.
   *
   * @type {{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null}
   */
  private longPress: { timer: ReturnType<typeof setTimeout>; x: number; y: number } | null = null;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Cleans up pending holds and the open menu when destroyed.
   */
  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.cancelLongPress();
      this.closing?.unsubscribe();
      if (this.isOpen()) this.cwContextMenuTriggerFor().close();
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method onContextMenu
   *
   * @description
   * Opens the menu at the pointer when the native menu is intercepted.
   *
   * @param {MouseEvent} event - Context menu event received by the trigger.
   */
  protected onContextMenu(event: MouseEvent): void {
    // An inner region already handled it, or the browser's menu stays.
    if (event.defaultPrevented || this.cwContextMenuDisabled() || isEditable(event.target)) return;
    event.preventDefault();
    this.cancelLongPress();
    if (performance.now() < this.swallowUntil) return;
    this.open({ x: event.clientX, y: event.clientY }, this.element, 'panel');
  }

  /**
   * Method onKeydown
   *
   * @description
   * Opens the menu on the focused element for keyboard shortcuts.
   *
   * @param {KeyboardEvent} event - Keyboard event received by the trigger.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const shortcut: boolean =
      event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey);
    if (!shortcut || event.defaultPrevented || this.cwContextMenuDisabled()) return;
    if (isEditable(event.target)) return;
    event.preventDefault();
    // Sheet, "Clavier": the menu opens on the focused element's top-left corner.
    const focused: HTMLElement = event.target instanceof HTMLElement ? event.target : this.element;
    const { left, top }: DOMRect = focused.getBoundingClientRect();
    this.swallowUntil = performance.now() + SWALLOW_AFTER_OPEN;
    this.open({ x: left, y: top }, focused, 'first');
  }

  /**
   * Method onPointerDown
   *
   * @description
   * Starts a touch hold to open the menu.
   *
   * @param {PointerEvent} event - Pointer event used to start a touch hold.
   */
  protected onPointerDown(event: PointerEvent): void {
    this.cancelLongPress();
    if (event.pointerType !== 'touch' || this.cwContextMenuDisabled()) return;
    if (isEditable(event.target)) return;
    const { clientX: x, clientY: y }: PointerEvent = event;
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      this.longPress = null;
      this.swallowUntil = performance.now() + SWALLOW_AFTER_OPEN;
      this.open({ x, y }, this.element, 'panel');
    }, LONG_PRESS);
    this.longPress = { timer, x, y };
  }

  /**
   * Method onPointerMove
   *
   * @description
   * Cancels a touch hold when the pointer moves too far.
   *
   * @param {PointerEvent} event - Pointer event used to detect movement during a touch hold.
   */
  protected onPointerMove(event: PointerEvent): void {
    const press: { timer: ReturnType<typeof setTimeout>; x: number; y: number } | null =
      this.longPress;
    if (!press) return;
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > LONG_PRESS_SLOP) {
      this.cancelLongPress();
    }
  }

  /**
   * Method cancelLongPress
   *
   * @description
   * Cancels any pending touch hold.
   */
  protected cancelLongPress(): void {
    if (!this.longPress) return;
    clearTimeout(this.longPress.timer);
    this.longPress = null;
  }

  /**
   * Method open
   *
   * @description
   * Opens the menu and tracks its close event.
   *
   * @param {CwMenuPoint} point - Coordinates used as the menu origin.
   * @param {HTMLElement} trigger - Element used to restore focus.
   * @param {CwMenuFocus} focus - Initial focus target within the menu.
   */
  private open(point: CwMenuPoint, trigger: HTMLElement, focus: CwMenuFocus): void {
    const menu: CwMenu = this.cwContextMenuTriggerFor();
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
  // #endregion
}
