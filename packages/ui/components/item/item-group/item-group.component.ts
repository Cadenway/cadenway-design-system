import { FocusKeyManager, type FocusableOption } from '@angular/cdk/a11y';
import {
  booleanAttribute,
  Component,
  computed,
  contentChildren,
  inject,
  Injector,
  input,
  signal,
  type Signal,
  type InputSignalWithTransform,
  type WritableSignal,
} from '@angular/core';

import { ɵnavigateList } from '@cadenway/ui/core';

import type { CwItem } from '../item.component';
import { ITEM_GROUP_ITEM } from '../item.token';

// The group items enter one by one, blurred, 60 ms then 30 ms more per item, twelve at most
// (cw-motion-tokens, "STAGGER"); nothing under reduced motion.
/**
 * Constant STAGGER
 *
 * @description
 * Staggered entry animation classes for group items.
 *
 * @type {string}
 */
const STAGGER: string =
  '*:animate-item-in *:motion-reduce:animate-none [&>*:nth-child(1)]:[animation-delay:60ms] [&>*:nth-child(2)]:[animation-delay:90ms] [&>*:nth-child(3)]:[animation-delay:120ms] [&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:180ms] [&>*:nth-child(6)]:[animation-delay:210ms] [&>*:nth-child(7)]:[animation-delay:240ms] [&>*:nth-child(8)]:[animation-delay:270ms] [&>*:nth-child(9)]:[animation-delay:300ms] [&>*:nth-child(10)]:[animation-delay:330ms] [&>*:nth-child(11)]:[animation-delay:360ms] [&>*:nth-child(12)]:[animation-delay:390ms]';

/**
 * Interface KeyOption
 *
 * @description
 * Item adapter for the CDK focus key manager.
 */
interface KeyOption extends FocusableOption {
  // #region Properties
  /**
   * Property item
   * @readonly
   *
   * @description
   * Item controlled by this focus option.
   *
   * @type {CwItem}
   */
  readonly item: CwItem;
  // #endregion
}

/**
 * Component CwItemGroup
 *
 * @description
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
  // #region Properties
  /**
   * Property selectable
   * @readonly
   *
   * @description
   * Whether rows can be selected in a listbox.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly selectable: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property items
   * @readonly
   *
   * @description
   * Descendant items participating in the group.
   *
   * @type {Signal<readonly CwItem[]>}
   */
  private readonly items: Signal<readonly CwItem[]> = contentChildren(ITEM_GROUP_ITEM, {
    descendants: true,
  });

  /**
   * Property options
   * @readonly
   *
   * @description
   * Cached focus adapters for each item.
   *
   * @type {WeakMap<CwItem, KeyOption>}
   */
  private readonly options: WeakMap<CwItem, KeyOption> = new WeakMap<CwItem, KeyOption>();

  /**
   * Property keyOptions
   * @readonly
   *
   * @description
   * Focus adapters for current items.
   *
   * @type {Signal<KeyOption[]>}
   */
  private readonly keyOptions: Signal<KeyOption[]> = computed(() =>
    this.items().map((item) => this.option(item)),
  );

  /**
   * Property active
   * @readonly
   *
   * @description
   * Item most recently reached by focus or navigation.
   *
   * @type {WritableSignal<CwItem | null>}
   */
  private readonly active: WritableSignal<CwItem | null> = signal<CwItem | null>(null);

  /**
   * Property keyManager
   * @readonly
   *
   * @description
   * Keyboard manager for vertical item navigation.
   *
   * @type {FocusKeyManager<KeyOption>}
   */
  private readonly keyManager: FocusKeyManager<KeyOption> = new FocusKeyManager<KeyOption>(
    this.keyOptions,
    inject(Injector),
  )
    .withVerticalOrientation()
    .withHomeAndEnd()
    .skipPredicate((option) => option.item.disabled());

  /**
   * Property tabStop
   * @readonly
   *
   * @description
   * Enabled item holding the group tab stop.
   *
   * @type {Signal<CwItem | null>}
   */
  public readonly tabStop: Signal<CwItem | null> = computed(() => {
    const items: readonly CwItem[] = this.items();
    const active: CwItem | null = this.active();
    if (active && items.includes(active) && !active.disabled()) return active;
    return items.find((item) => !item.disabled()) ?? null;
  });

  /**
   * Property highlighted
   * @readonly
   *
   * @description
   * Item most recently reached by navigation.
   *
   * @type {Signal<CwItem | null>}
   */
  public readonly highlighted: Signal<CwItem | null> = this.active.asReadonly();

  /**
   * Property role
   * @readonly
   *
   * @description
   * Accessible role of the group.
   *
   * @type {Signal<'listbox' | 'group' | 'list'>}
   */
  protected readonly role: Signal<'listbox' | 'group' | 'list'> = computed<
    'listbox' | 'group' | 'list'
  >(() => {
    if (this.selectable()) return 'listbox';
    // A link or a button keeps its native role: `listitem` is not allowed on it (ARIA in HTML) and
    // a list owns list items only, so a group holding one is a plain `group`.
    const clickable: boolean = this.items().some((item) =>
      ['A', 'BUTTON'].includes(item.element.tagName),
    );
    return clickable ? 'group' : 'list';
  });

  /**
   * Property itemRole
   * @readonly
   *
   * @description
   * Accessible role assigned to group rows.
   *
   * @type {Signal<'option' | 'listitem' | null>}
   */
  public readonly itemRole: Signal<'option' | 'listitem' | null> = computed<
    'option' | 'listitem' | null
  >(() => {
    const role: 'listbox' | 'group' | 'list' = this.role();
    return role === 'listbox' ? 'option' : role === 'list' ? 'listitem' : null;
  });
  // #endregion

  // #region Methods
  /**
   * Method onKeydown
   *
   * @description
   * Moves focus between enabled items using navigation keys.
   *
   * @param {KeyboardEvent} event - Keyboard event used to navigate between enabled items.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const option: KeyOption | undefined = this.optionOf(event.target);
    if (!option || !['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    this.keyManager.updateActiveItem(option);
    if (ɵnavigateList(this.keyManager, event, 'vertical')) event.preventDefault();
    this.active.set(this.keyManager.activeItem?.item ?? null);
  }

  /**
   * Method onFocusin
   *
   * @description
   * Tracks the item receiving focus.
   *
   * @param {FocusEvent} event - Focus event identifying the active item.
   */
  protected onFocusin(event: FocusEvent): void {
    const option: KeyOption | undefined = this.optionOf(event.target);
    if (!option) return;
    this.keyManager.updateActiveItem(option);
    this.active.set(option.item);
  }

  /**
   * Method optionOf
   *
   * @description
   * Finds the focus adapter for an event target.
   *
   * @param {EventTarget | null} target - Event target to match against item elements.
   *
   * @returns {KeyOption | undefined} Focus adapter for the target, or undefined when it is not an item.
   */
  private optionOf(target: EventTarget | null): KeyOption | undefined {
    return this.keyOptions().find((option) => option.item.element === target);
  }

  /**
   * Method option
   *
   * @description
   * Returns a cached focus adapter for an item.
   *
   * @param {CwItem} item - Item requiring a focus adapter.
   *
   * @returns {KeyOption} Cached focus adapter for the item.
   */
  private option(item: CwItem): KeyOption {
    let option: KeyOption | undefined = this.options.get(item);
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
  // #endregion
}
