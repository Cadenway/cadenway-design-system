import { FocusKeyManager, type FocusableOption } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  type Signal,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  signal,
} from '@angular/core';

import { ɵnavigateList } from '@cadenway/ui/core';

import type { CwItem } from './item.component';
import { ITEM_GROUP_ITEM } from './item.token';

// The group items enter one by one, blurred, 60 ms then 30 ms more per item, twelve at most
// (cw-motion-tokens, "STAGGER"); nothing under reduced motion.
const STAGGER =
  '*:animate-item-in *:motion-reduce:animate-none [&>*:nth-child(1)]:[animation-delay:60ms] [&>*:nth-child(2)]:[animation-delay:90ms] [&>*:nth-child(3)]:[animation-delay:120ms] [&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:180ms] [&>*:nth-child(6)]:[animation-delay:210ms] [&>*:nth-child(7)]:[animation-delay:240ms] [&>*:nth-child(8)]:[animation-delay:270ms] [&>*:nth-child(9)]:[animation-delay:300ms] [&>*:nth-child(10)]:[animation-delay:330ms] [&>*:nth-child(11)]:[animation-delay:360ms] [&>*:nth-child(12)]:[animation-delay:390ms]';

/** An item adapted to the CDK key manager, which reads `disabled` as a plain boolean. */
interface KeyOption extends FocusableOption {
  readonly item: CwItem;
}

/**
 * A list of `cw-item` rows with one tab stop and arrow navigation: ↑ ↓ move between the rows,
 * Home and End jump to the first and last, Tab leaves for the actions of the row or the next
 * control (Item sheet of the Design System artifact, CDK `FocusKeyManager`).
 *
 * Name it with `aria-label` (« Notifications »). It is `role="list"` with `listitem` rows; when it
 * holds `<a>` or `<button>` items, which keep their native role, it is `role="group"`. With
 * `selectable` it is a `role="listbox"` (`aria-multiselectable`) of options toggled by Space. The
 * rows enter one by one (`animate-item-in`, 30 ms apart), not under reduced motion. One size and
 * one variant per group, except `muted` for unread rows.
 */
@Component({
  selector: 'cw-item-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: `flex flex-col gap-1 ${STAGGER}`,
    '[attr.role]': 'role()',
    '[attr.aria-multiselectable]': 'selectable() ? "true" : null',
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusin($event)',
  },
  templateUrl: './item-group.component.html',
})
export class CwItemGroup {
  /** Turns the group into a multi-selection listbox: Space toggles the `selected` of a row. */
  readonly selectable = input(false, { transform: booleanAttribute });

  private readonly items = contentChildren(ITEM_GROUP_ITEM, { descendants: true });
  private readonly options = new WeakMap<CwItem, KeyOption>();
  private readonly keyOptions = computed(() => this.items().map((item) => this.option(item)));
  private readonly active = signal<CwItem | null>(null);
  private readonly keyManager = new FocusKeyManager<KeyOption>(this.keyOptions, inject(Injector))
    .withVerticalOrientation()
    .withHomeAndEnd()
    .skipPredicate((option) => option.item.disabled());

  /** The row of the group that holds the tab stop: the last focused one, else the first enabled. */
  readonly tabStop: Signal<CwItem | null> = computed(() => {
    const items = this.items();
    const active = this.active();
    if (active && items.includes(active) && !active.disabled()) return active;
    return items.find((item) => !item.disabled()) ?? null;
  });

  /** The row reached by the arrows, for the `data-highlighted` hook. */
  readonly highlighted: Signal<CwItem | null> = this.active.asReadonly();

  protected readonly role = computed<'listbox' | 'group' | 'list'>(() => {
    if (this.selectable()) return 'listbox';
    // A link or a button keeps its native role: `listitem` is not allowed on it (ARIA in HTML) and
    // a list owns list items only, so a group holding one is a plain `group`.
    const clickable = this.items().some((item) => ['A', 'BUTTON'].includes(item.element.tagName));
    return clickable ? 'group' : 'list';
  });

  /** The role of the rows of the group: `option`, `listitem`, or their own in a `group`. */
  readonly itemRole = computed<'option' | 'listitem' | null>(() => {
    const role = this.role();
    return role === 'listbox' ? 'option' : role === 'list' ? 'listitem' : null;
  });

  protected onKeydown(event: KeyboardEvent): void {
    const option = this.optionOf(event.target);
    if (!option || !['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    this.keyManager.updateActiveItem(option);
    if (ɵnavigateList(this.keyManager, event, 'vertical')) event.preventDefault();
    this.active.set(this.keyManager.activeItem?.item ?? null);
  }

  protected onFocusin(event: FocusEvent): void {
    const option = this.optionOf(event.target);
    if (!option) return;
    this.keyManager.updateActiveItem(option);
    this.active.set(option.item);
  }

  private optionOf(target: EventTarget | null): KeyOption | undefined {
    return this.keyOptions().find((option) => option.item.element === target);
  }

  private option(item: CwItem): KeyOption {
    let option = this.options.get(item);
    if (!option) {
      option = {
        item,
        focus: () => {
          item.focus();
        },
        get disabled() {
          return item.disabled();
        },
      };
      this.options.set(item, option);
    }
    return option;
  }
}
