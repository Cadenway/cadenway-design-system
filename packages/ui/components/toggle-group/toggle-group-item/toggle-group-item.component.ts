import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  forwardRef,
  HostAttributeToken,
  inject,
  input,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import type { FocusableOption } from '@angular/cdk/a11y';
import { CwRipple } from '@cadenway/ui/core';

import { CwToggleGroup } from '../toggle-group.component';
import { TOGGLE_GROUP_ITEM } from '../toggle-group-item.token';
import type { CwToggleGroupSize, CwToggleGroupVariant } from '../toggle-group.types';

/* Literal class strings (Toggle Group sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. The items carry the classes of the Toggle sheet ("mêmes
   classes que Toggle"); they are repeated here because one entry point never reaches into another's
   internals. Icons are `ng-icon`: their size goes through `--ng-icon__size`. */
/**
 * Constant ITEM_BASE
 *
 * @description
 * Shared toggle item layout and interaction classes.
 *
 * @type {string}
 */
const ITEM_BASE: string =
  'relative isolate overflow-hidden inline-flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap text-muted-foreground ' +
  'transition-[color,background-color,box-shadow] motion-reduce:transition-none hover:bg-accent hover:text-foreground ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  'data-[state=on]:bg-selected data-[state=on]:text-foreground data-[state=on]:hover:bg-selected ' +
  '[&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem] ' +
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/**
 * Constant ITEM_VARIANTS
 *
 * @description
 * Visual classes for each group variant.
 *
 * @type {Record<CwToggleGroupVariant, string>}
 */
const ITEM_VARIANTS: Record<CwToggleGroupVariant, string> = {
  default: 'bg-transparent',
  outline: 'border border-input bg-transparent',
};

/**
 * Constant ITEM_SIZES
 *
 * @description
 * Dimension classes for each group size.
 *
 * @type {Record<CwToggleGroupSize, string>}
 */
const ITEM_SIZES: Record<CwToggleGroupSize, string> = {
  sm: 'h-7 min-w-7 rounded-md px-1.5',
  default: 'h-8 min-w-8 rounded-lg px-2',
  lg: 'h-9 min-w-9 rounded-lg px-2.5',
};

/**
 * Class CwToggleGroupItem
 * @class CwToggleGroupItem
 *
 * @description
 * One option of a `cw-toggle-group`: put it on a native `<button>` with its `value`.
 *
 * Takes the variant and size of its group, `role="radio"` and `aria-checked` in single choice,
 * `aria-pressed` in multiple choice, `data-state="on|off"`, and `tabindex` 0 only on the group's Tab
 * stop. Sets `type="button"` when no type is given. An icon-only item needs an `aria-label`. Every
 * press draws the ripple (`CwRipple`), except under reduced motion.
 */
@Component({
  selector: 'button[cwToggleGroupItem]',
  providers: [{ provide: TOGGLE_GROUP_ITEM, useExisting: forwardRef(() => CwToggleGroupItem) }],
  hostDirectives: [CwRipple],
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type',
    '[attr.role]': 'single() ? "radio" : null',
    '[attr.aria-checked]': 'single() ? on() : null',
    '[attr.aria-pressed]': 'single() ? null : on()',
    '[attr.data-state]': 'on() ? "on" : "off"',
    '[attr.disabled]': 'isDisabled() ? "" : null',
    '[attr.tabindex]': 'group.tabStop() === this ? 0 : -1',
    '(click)': 'group.activate(this)',
    '(focus)': 'group.focused(this)',
  },
  templateUrl: './toggle-group-item.component.html',
})
export class CwToggleGroupItem {
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Value this item stands for in the group's value.
   *
   * @type {InputSignal<string>}
   */
  public readonly value: InputSignal<string> = input.required<string>();

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Disables this item; the arrow keys skip it.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property group
   * @readonly
   *
   * @description
   * Containing group providing shared selection and styling.
   *
   * @type {CwToggleGroup}
   */
  protected readonly group: CwToggleGroup = inject(CwToggleGroup);

  /**
   * Property element
   * @readonly
   *
   * @description
   * Native button used for focus.
   *
   * @type {HTMLButtonElement}
   */
  private readonly element: HTMLButtonElement =
    inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;

  /**
   * Property type
   * @readonly
   *
   * @description
   * Declared button type or a safe button default.
   *
   * @type {string}
   */
  protected readonly type: string =
    inject(new HostAttributeToken('type'), { optional: true }) ?? 'button';

  /**
   * Property isDisabled
   * @readonly
   *
   * @description
   * Whether the item or its group is disabled.
   *
   * @type {Signal<boolean>}
   */
  public readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.group.isDisabled(),
  );

  /**
   * Property keyOption
   * @readonly
   *
   * @description
   * Stable focus-manager adapter for this item.
   *
   * @type {FocusableOption}
   */
  public readonly keyOption: FocusableOption = optionOf(this);

  /**
   * Property single
   * @readonly
   *
   * @description
   * Whether the group uses single choice.
   *
   * @type {Signal<boolean>}
   */
  protected readonly single: Signal<boolean> = computed(() => this.group.type() === 'single');

  /**
   * Property on
   * @readonly
   *
   * @description
   * Whether the item is selected.
   *
   * @type {Signal<boolean>}
   */
  protected readonly on: Signal<boolean> = computed(() =>
    this.group.selected().includes(this.value()),
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Item classes for the group variant and size.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${ITEM_BASE} ${ITEM_VARIANTS[this.group.variant()]} ${ITEM_SIZES[this.group.size()]}`,
  );
  // #endregion

  // #region Methods
  /**
   * Method focus
   * @method focus
   *
   * @description
   * Moves focus to the native button.
   *
   * @param {FocusOptions} [options] - Optional browser focus behavior.
   */
  public focus(options?: FocusOptions): void {
    this.element.focus(options);
  }
  // #endregion
}

/* The item's signal input `disabled` cannot be the `disabled: boolean` the CDK key manager reads, so
   the manager moves through one plain option per item that reads the item's state when asked. */
/**
 * Function optionOf
 *
 * @description
 * Adapts the item to the focus manager with its current disabled state.
 *
 * @param {CwToggleGroupItem} item - Item represented by the focus option.
 *
 * @returns {FocusableOption} Focus option delegating to the item.
 */
function optionOf(item: CwToggleGroupItem): FocusableOption {
  return {
    focus: () => {
      item.focus();
    },
    get disabled(): boolean {
      return item.isDisabled();
    },
  };
}
