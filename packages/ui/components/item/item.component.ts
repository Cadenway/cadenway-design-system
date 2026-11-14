import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  forwardRef,
  HostAttributeToken,
  inject,
  input,
  model,
  type Signal,
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
} from '@angular/core';
import { ɵFOCUS_INSET } from '@cadenway/ui/core';

import { CwItemGroup } from './item-group/item-group.component';
import { ITEM_GROUP_ITEM } from './item.token';
import type { CwItemSize, CwItemVariant } from './item.types';

/* Literal class strings (Item sheet and preview of the Design System artifact). Items are rows of a
   container, so the focus ring is the inset one (FOCUS_INSET, cw-tokens-and-theme). */
/**
 * Constant BASE
 *
 * @description
 * Base item classes with an inset focus ring.
 *
 * @type {string}
 */
const BASE: string = `group/item flex w-full items-center rounded-lg border text-left text-sm transition-colors ${ɵFOCUS_INSET}`;

/**
 * Constant VARIANTS
 *
 * @description
 * Classes for each item appearance.
 *
 * @type {Record<CwItemVariant, string>}
 */
const VARIANTS: Record<CwItemVariant, string> = {
  default: 'border-transparent',
  outline: 'border-border',
  muted: 'border-transparent bg-muted',
};

// Selected replaces the fill of the variant (`bg-selected`); the frame of `outline` stays.
/**
 * Constant SELECTED_VARIANTS
 *
 * @description
 * Classes for selected items by appearance.
 *
 * @type {Record<CwItemVariant, string>}
 */
const SELECTED_VARIANTS: Record<CwItemVariant, string> = {
  default: 'border-transparent bg-selected',
  outline: 'border-border bg-selected',
  muted: 'border-transparent bg-selected',
};

/**
 * Constant SIZES
 *
 * @description
 * Spacing classes by item size.
 *
 * @type {Record<CwItemSize, string>}
 */
const SIZES: Record<CwItemSize, string> = {
  default: 'gap-3 px-3 py-2.5',
  sm: 'gap-2.5 px-3 py-2',
  xs: 'gap-2 px-2 py-1.5',
};

/**
 * Constant CLICKABLE
 *
 * @description
 * Classes for interactive items.
 *
 * @type {string}
 */
const CLICKABLE: string = 'cursor-pointer hover:bg-accent';
/**
 * Constant DISABLED
 *
 * @description
 * Classes for disabled items.
 *
 * @type {string}
 */
const DISABLED: string = 'pointer-events-none opacity-50';

/**
 * Component CwItem
 *
 * @description
 * A row of content: media, title, description, actions; for notifications, members, integrations,
 * files and search results, never tasks (Item sheet of the Design System artifact).
 *
 * As `cw-item` it is a static row; on `<a>` or `<button>` it is clickable (hover veil; listen to the
 * native `(click)`). Inside a `cw-item-group` it joins the group's roving focus (one tab stop, ↑ ↓
 * Home End) and, in a `selectable` group, it is an option: click (on `cw-item`) or Space toggles
 * `[(selected)]`. `selected` lays `bg-selected` and is announced through `aria-selected` in a
 * selectable group only. `unread` takes the `muted` look and makes `cw-item-title` show a dot and
 * a hidden « (non lu) ». `disabled` sets `aria-disabled`, dims the row, ignores clicks and leaves
 * the roving focus. Never nest a focusable control in an `<a>`/`<button>` item or in an option:
 * put the actions on a `cw-item`.
 */
@Component({
  selector: 'cw-item, a[cwItem], button[cwItem]',
  providers: [{ provide: ITEM_GROUP_ITEM, useExisting: forwardRef(() => CwItem) }],
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'role()',
    '[attr.type]': 'isButton ? (declaredType ?? "button") : null',
    '[attr.tabindex]': 'tabIndex()',
    '[attr.aria-selected]': 'role() === "option" ? selected() : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.data-highlighted]': 'group?.highlighted() === this ? "" : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '(click)': 'onClick($event)',
    '(keydown.space)': 'onSpace($event)',
    '(keyup.space)': 'onSpaceUp($event)',
  },
  templateUrl: './item.component.html',
})
export class CwItem {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Appearance of the row; unread items use the muted appearance.
   *
   * @type {InputSignal<CwItemVariant>}
   */
  public readonly variant: InputSignal<CwItemVariant> = input<CwItemVariant>('default');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Spacing and media size.
   *
   * @type {InputSignal<CwItemSize>}
   */
  public readonly size: InputSignal<CwItemSize> = input<CwItemSize>('default');

  /**
   * Property selected
   * @readonly
   *
   * @description
   * Selection state of the row.
   *
   * @type {ModelSignal<boolean>}
   */
  public readonly selected: ModelSignal<boolean> = model(false);

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Whether the row is disabled.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property unread
   * @readonly
   *
   * @description
   * Whether the row is unread.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly unread: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property unreadLabel
   * @readonly
   *
   * @description
   * Accessible text for an unread row.
   *
   * @type {InputSignal<string>}
   */
  public readonly unreadLabel: InputSignal<string> = input('(non lu)');

  /**
   * Property element
   * @readonly
   *
   * @description
   * Host element used by the group focus manager.
   *
   * @type {HTMLElement}
   */
  public readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property group
   * @readonly
   *
   * @description
   * Containing item group, if present.
   *
   * @type {CwItemGroup | null}
   */
  protected readonly group: CwItemGroup | null = inject(CwItemGroup, { optional: true });

  /**
   * Property isButton
   * @readonly
   *
   * @description
   * Whether the host element is a button.
   *
   * @type {boolean}
   */
  protected readonly isButton: boolean = this.element.tagName === 'BUTTON';

  /**
   * Property declaredType
   * @readonly
   *
   * @description
   * Type attribute supplied on the host.
   *
   * @type {string | null}
   */
  protected readonly declaredType: string | null = inject(new HostAttributeToken('type'), {
    optional: true,
  });

  /**
   * Property clickable
   * @readonly
   *
   * @description
   * Whether the host is a native interactive element.
   *
   * @type {boolean}
   */
  private readonly clickable: boolean = this.isButton || this.element.tagName === 'A';

  /**
   * Property role
   * @readonly
   *
   * @description
   * Role assigned by the containing group.
   *
   * @type {Signal<string | null>}
   */
  protected readonly role: Signal<string | null> = computed(() => this.group?.itemRole() ?? null);

  /**
   * Property tabIndex
   * @readonly
   *
   * @description
   * Tab stop selected by the group or disabled state.
   *
   * @type {Signal<number | null>}
   */
  protected readonly tabIndex: Signal<number | null> = computed(() => {
    if (this.group) return this.group.tabStop() === this ? 0 : -1;
    if (this.clickable && this.disabled()) return -1;
    return null;
  });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Classes for the current appearance and state.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => {
    const variant: CwItemVariant = this.unread() ? 'muted' : this.variant();
    return [
      BASE,
      this.selected() ? SELECTED_VARIANTS[variant] : VARIANTS[variant],
      SIZES[this.size()],
      this.clickable || this.group?.selectable() ? CLICKABLE : '',
      this.disabled() ? DISABLED : '',
    ].join(' ');
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Prevents disabled rows from handling click events.
   */
  public constructor() {
    // Capture phase: the guard runs before the consumer's own (click) listener on the same element.
    this.element.addEventListener(
      'click',
      (event) => {
        if (this.disabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true },
    );
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   *
   * @description
   * Moves focus to the row for the group focus manager.
   *
   * @param {FocusOptions} [options] - Optional browser focus behavior.
   */
  public focus(options?: FocusOptions): void {
    this.element.focus(options);
  }

  /**
   * Method onClick
   *
   * @description
   * Toggles a selectable static row when clicked.
   *
   * @param {MouseEvent} event - Click event received by the item.
   */
  protected onClick(event: MouseEvent): void {
    // A link or a button activates on click; only a static row of a selectable group selects.
    if (this.group?.selectable() && !this.clickable && !this.disabled()) {
      event.preventDefault();
      this.toggle();
    }
  }

  /**
   * Method onSpace
   *
   * @description
   * Toggles a selectable row on Space.
   *
   * @param {Event} event - Space key event received by the item.
   */
  protected onSpace(event: Event): void {
    if (event.target !== this.element || !this.group?.selectable() || this.disabled()) return;
    // Space would also scroll the page or click a button: in a selectable group it only selects.
    event.preventDefault();
    this.toggle();
  }

  /**
   * Method onSpaceUp
   *
   * @description
   * Prevents button activation when Space selects a row.
   *
   * @param {Event} event - Space key release received by the item.
   */
  protected onSpaceUp(event: Event): void {
    // A button activates on the release of Space: in a selectable group, Space only selects.
    if (event.target === this.element && this.group?.selectable()) event.preventDefault();
  }

  /**
   * Method toggle
   *
   * @description
   * Reverses the selected state.
   */
  private toggle(): void {
    this.selected.set(!this.selected());
  }
  // #endregion
}
