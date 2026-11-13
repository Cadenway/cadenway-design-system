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
} from '@angular/core';
import { ɵFOCUS_INSET } from '@cadenway/ui/core';

import { CwItemGroup } from './item-group/item-group.component';
import { ITEM_GROUP_ITEM } from './item.token';
import type { CwItemSize, CwItemVariant } from './item.types';

/* Literal class strings (Item sheet and preview of the Design System artifact). Items are rows of a
   container, so the focus ring is the inset one (FOCUS_INSET, cw-tokens-and-theme). */
const BASE = `group/item flex w-full items-center rounded-lg border text-left text-sm transition-colors ${ɵFOCUS_INSET}`;

const VARIANTS: Record<CwItemVariant, string> = {
  default: 'border-transparent',
  outline: 'border-border',
  muted: 'border-transparent bg-muted',
};

// Selected replaces the fill of the variant (`bg-selected`); the frame of `outline` stays.
const SELECTED_VARIANTS: Record<CwItemVariant, string> = {
  default: 'border-transparent bg-selected',
  outline: 'border-border bg-selected',
  muted: 'border-transparent bg-selected',
};

const SIZES: Record<CwItemSize, string> = {
  default: 'gap-3 px-3 py-2.5',
  sm: 'gap-2.5 px-3 py-2',
  xs: 'gap-2 px-2 py-1.5',
};

const CLICKABLE = 'cursor-pointer hover:bg-accent';
const DISABLED = 'pointer-events-none opacity-50';

/**
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
  // Also on `<a>` and `<button>`, as its sheet requires: they keep their native role, focus and
  // activation.
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
  /** Look of the row; `unread` forces `muted`. */
  readonly variant = input<CwItemVariant>('default');
  /** Spacing and media size. */
  readonly size = input<CwItemSize>('default');
  /** Whether the row is selected; `[(selected)]`, toggled by Space in a selectable group. */
  readonly selected = model(false);
  /** Dims the row, ignores clicks and removes it from the roving focus. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Unread notification: `muted` look, a dot and a hidden text before the title. */
  readonly unread = input(false, { transform: booleanAttribute });
  /** Hidden text of an unread row, after its title. */
  readonly unreadLabel = input('(non lu)');

  /** The host element, focused by the group's roving focus. */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly group: CwItemGroup | null = inject(CwItemGroup, { optional: true });
  protected readonly isButton = this.element.tagName === 'BUTTON';
  protected readonly declaredType = inject(new HostAttributeToken('type'), { optional: true });
  private readonly clickable = this.isButton || this.element.tagName === 'A';

  protected readonly role: Signal<string | null> = computed(() => this.group?.itemRole() ?? null);

  protected readonly tabIndex: Signal<number | null> = computed(() => {
    if (this.group) return this.group.tabStop() === this ? 0 : -1;
    if (this.clickable && this.disabled()) return -1;
    return null;
  });

  protected readonly classes: Signal<string> = computed(() => {
    const variant = this.unread() ? 'muted' : this.variant();
    return [
      BASE,
      this.selected() ? SELECTED_VARIANTS[variant] : VARIANTS[variant],
      SIZES[this.size()],
      this.clickable || this.group?.selectable() ? CLICKABLE : '',
      this.disabled() ? DISABLED : '',
    ].join(' ');
  });

  constructor() {
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

  /** Moves the focus to the row (the group's roving focus calls it). */
  focus(options?: FocusOptions): void {
    this.element.focus(options);
  }

  protected onClick(event: MouseEvent): void {
    // A link or a button activates on click; only a static row of a selectable group selects.
    if (this.group?.selectable() && !this.clickable && !this.disabled()) {
      event.preventDefault();
      this.toggle();
    }
  }

  protected onSpace(event: Event): void {
    if (event.target !== this.element || !this.group?.selectable() || this.disabled()) return;
    // Space would also scroll the page or click a button: in a selectable group it only selects.
    event.preventDefault();
    this.toggle();
  }

  protected onSpaceUp(event: Event): void {
    // A button activates on the release of Space: in a selectable group, Space only selects.
    if (event.target === this.element && this.group?.selectable()) event.preventDefault();
  }

  private toggle(): void {
    this.selected.set(!this.selected());
  }
}
