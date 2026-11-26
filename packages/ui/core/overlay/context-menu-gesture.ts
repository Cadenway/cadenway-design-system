import type { ConnectedPosition } from '@angular/cdk/overlay';

/**
 * Constant ɵAT_POINT
 *
 * @description
 * Overlay positions that put a context menu's top-left corner on a point, flipped up or left when
 * there is no room (ContextMenu sheet of the Design System artifact, "Position"). A point has no
 * size, so only the overlay corner changes.
 *
 * @type {readonly ConnectedPosition[]}
 */
export const ɵAT_POINT: readonly ConnectedPosition[] = [
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
  { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
];

/**
 * Constant SWALLOW_AFTER_OPEN
 *
 * @description
 * Time in milliseconds during which the browser's own `contextmenu` that follows Shift + F10 or
 * the Menu key, on the same element, is swallowed so the menu does not reopen at another point.
 *
 * @type {number}
 */
const SWALLOW_AFTER_OPEN: number = 800;

/**
 * Interface ɵContextMenuRequest
 *
 * @description
 * Where and how a context menu opens, in the shape of the menu brick's open options.
 */
export interface ɵContextMenuRequest {
  // #region Properties
  /**
   * Property origin
   *
   * @description
   * Viewport point the panel's top-left corner sits on.
   *
   * @type {{ readonly x: number; readonly y: number }}
   * @readonly
   */
  readonly origin: { readonly x: number; readonly y: number };

  /**
   * Property trigger
   *
   * @description
   * Element that names the panel and takes the focus back when it closes.
   *
   * @type {HTMLElement}
   * @readonly
   */
  readonly trigger: HTMLElement;

  /**
   * Property focus
   *
   * @description
   * First focus in the panel: the panel itself after a pointer, the first item after a key.
   *
   * @type {'panel' | 'first'}
   * @readonly
   */
  readonly focus: 'panel' | 'first';

  /**
   * Property positions
   *
   * @description
   * Overlay positions at the point (`ɵAT_POINT`).
   *
   * @type {readonly ConnectedPosition[]}
   * @readonly
   */
  readonly positions: readonly ConnectedPosition[];
  // #endregion
}

/**
 * Function isEditable
 *
 * @description
 * Reports whether the target is or belongs to an editable field, where the browser's own menu
 * stays.
 *
 * @param {EventTarget | null} target - Event target to inspect.
 * @returns {boolean} Whether the target is editable.
 */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || !!target.closest('input, textarea, select');
}

/**
 * Class ɵContextMenuGesture
 *
 * @description
 * Recognizes the gestures that open a context menu for a brick whose menu is optional or whose
 * target is only known when the gesture happens (a card, a day under the pointer), where the
 * `[cwContextMenuTriggerFor]` directive, bound once to a required menu and static data, does not
 * fit. A right click gives a request at the pointer; Shift + F10 and the Menu key give one at the
 * focused element's top-left corner, focusing the first item (ContextMenu sheet, "Clavier"). The
 * gesture is prevented when a request is returned. Editable fields and events already handled by
 * an inner region return `null` and keep the browser's menu. One instance per brick: it remembers
 * a keyboard opening to swallow the one browser `contextmenu` that follows it on the same element;
 * a right click elsewhere, or a second one, opens normally.
 */
export class ɵContextMenuGesture {
  // #region Properties
  /**
   * Property swallowUntil
   *
   * @description
   * Deadline, in `performance.now()` milliseconds, before which a native `contextmenu` is
   * swallowed.
   *
   * @type {number}
   */
  private swallowUntil: number = 0;

  /**
   * Property swallowTarget
   *
   * @description
   * Element of the last keyboard opening, whose paired native `contextmenu` is swallowed once.
   *
   * @type {EventTarget | null}
   */
  private swallowTarget: EventTarget | null = null;
  // #endregion

  // #region Methods
  /**
   * Method request
   *
   * @description
   * Reads a `contextmenu` or `keydown` event and returns where to open the menu, or `null` when the
   * event is not a context-menu gesture for this brick. A returned request has prevented the
   * event's default; the `contextmenu` that pairs with a keyboard opening (same target, the first
   * one, within `SWALLOW_AFTER_OPEN`) is prevented and returns `null`.
   *
   * @param {MouseEvent | KeyboardEvent} event - `contextmenu` or `keydown` event.
   * @param {HTMLElement} trigger - Element the menu belongs to after a pointer gesture.
   * @returns {ɵContextMenuRequest | null} Where to open the menu, or null.
   */
  public request(
    event: MouseEvent | KeyboardEvent,
    trigger: HTMLElement,
  ): ɵContextMenuRequest | null {
    if (event.defaultPrevented || isEditable(event.target)) return null;
    if (event instanceof KeyboardEvent) {
      const shortcut: boolean =
        event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey);
      if (!shortcut || event.ctrlKey || event.altKey || event.metaKey) return null;
      event.preventDefault();
      const focused: HTMLElement = event.target instanceof HTMLElement ? event.target : trigger;
      const { left, top }: DOMRect = focused.getBoundingClientRect();
      this.swallowUntil = performance.now() + SWALLOW_AFTER_OPEN;
      this.swallowTarget = event.target;
      return {
        origin: { x: left, y: top },
        trigger: focused,
        focus: 'first',
        positions: ɵAT_POINT,
      };
    }
    if (event.type !== 'contextmenu') return null;
    event.preventDefault();
    const paired: boolean =
      event.target === this.swallowTarget && performance.now() < this.swallowUntil;
    this.swallowTarget = null;
    if (paired) return null;
    return {
      origin: { x: event.clientX, y: event.clientY },
      trigger,
      focus: 'panel',
      positions: ɵAT_POINT,
    };
  }
  // #endregion
}
