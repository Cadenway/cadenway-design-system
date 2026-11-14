import {
  booleanAttribute,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  numberAttribute,
  output,
  signal,
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { FocusKeyManager, type FocusableOption } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { ɵnavigateList } from '@cadenway/ui/core';

import type { CwToggleGroupItem } from './toggle-group-item/toggle-group-item.component';
import { TOGGLE_GROUP_ITEM } from './toggle-group-item.token';
import type {
  CwToggleGroupOrientation,
  CwToggleGroupSize,
  CwToggleGroupType,
  CwToggleGroupValue,
  CwToggleGroupVariant,
} from './toggle-group.types';

/* Attached items (spacing 0): inner corners cancelled, shared borders merged, the focused item above
   its neighbors so its ring shows whole. `sm` items have `rounded-md` corners. */
/**
 * Constant ATTACHED
 *
 * @description
 * Joined-item classes by orientation and size.
 *
 * @type {Record<CwToggleGroupOrientation, Record<'sm' | 'other', string>>}
 */
const ATTACHED: Record<CwToggleGroupOrientation, Record<'sm' | 'other', string>> = {
  horizontal: {
    sm: 'flex w-fit items-center [&>*]:focus-visible:z-10 [&>*]:rounded-none [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*:not(:first-child)]:border-l-0',
    other:
      'flex w-fit items-center [&>*]:focus-visible:z-10 [&>*]:rounded-none [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg [&>*:not(:first-child)]:border-l-0',
  },
  vertical: {
    sm: 'flex w-fit flex-col [&>*]:focus-visible:z-10 [&>*]:rounded-none [&>*:first-child]:rounded-t-md [&>*:last-child]:rounded-b-md [&>*:not(:first-child)]:border-t-0',
    other:
      'flex w-fit flex-col [&>*]:focus-visible:z-10 [&>*]:rounded-none [&>*:first-child]:rounded-t-lg [&>*:last-child]:rounded-b-lg [&>*:not(:first-child)]:border-t-0',
  },
};

/**
 * Constant SPACED
 *
 * @description
 * Spaced-item layout classes by orientation.
 *
 * @type {Record<CwToggleGroupOrientation, string>}
 */
const SPACED: Record<CwToggleGroupOrientation, string> = {
  horizontal: 'flex w-fit items-center gap-1',
  vertical: 'flex w-fit flex-col gap-1',
};

/**
 * Class CwToggleGroup
 * @class CwToggleGroup
 *
 * @description
 * A set of linked toggles for one display setting, single or multiple choice: text formatting,
 * density, grouping (Toggle Group sheet of the Design System artifact).
 *
 * Project `button[cwToggleGroupItem]` elements. `type="single"` is a `role="radiogroup"` whose items
 * are `role="radio"` with `aria-checked`; the arrows select as they move. `type="multiple"` is a
 * `role="group"` whose items carry `aria-pressed`; the arrows only move the focus. One Tab stop
 * (roving tabindex through the CDK `FocusKeyManager`): the last focused item, else the first item
 * that is on, else the first enabled one; the arrows follow `orientation` and wrap, Home and End
 * reach the ends, disabled items are skipped. `variant` and `size` apply to every item; `spacing` 0
 * welds them, any other value spaces them by `gap-1`.
 *
 * `[(value)]` is a model (`string | null` in single, `string[]` in multiple); the group works with
 * Signal Forms (`[formField]`, it is a `FormValueControl`) and with Reactive or template-driven forms
 * (it is the control's value accessor). `aria-invalid` is set when the control is invalid and touched.
 * Name it with `ariaLabel`. Style hooks: `data-orientation`, `data-spacing`, `data-disabled`.
 */
@Component({
  selector: 'cw-toggle-group',
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'type() === "single" ? "radiogroup" : "group"',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-invalid]': 'isInvalid() ? "true" : null',
    '[attr.aria-required]': 'required() && type() === "single" ? "true" : null',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-spacing]': 'spacing()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '(keydown)': 'onKeydown($event)',
    '(focusout)': 'onFocusOut($event)',
  },
  templateUrl: './toggle-group.component.html',
})
export class CwToggleGroup implements FormValueControl<CwToggleGroupValue>, ControlValueAccessor {
  // #region Properties
  /**
   * Property type
   * @readonly
   *
   * @description
   * Single choice (radio group, the default) or multiple choice.
   *
   * @type {InputSignal<CwToggleGroupType>}
   */
  public readonly type: InputSignal<CwToggleGroupType> = input<CwToggleGroupType>('single');

  /**
   * Property value
   * @readonly
   *
   * @description
   * Value: `string | null` in single choice, `string[]` in multiple choice; `[(value)]`.
   *
   * @type {ModelSignal<CwToggleGroupValue>}
   */
  public readonly value: ModelSignal<CwToggleGroupValue> = model<CwToggleGroupValue>(null);

  /**
   * Property variant
   * @readonly
   *
   * @description
   * Look of every item.
   *
   * @type {InputSignal<CwToggleGroupVariant>}
   */
  public readonly variant: InputSignal<CwToggleGroupVariant> =
    input<CwToggleGroupVariant>('default');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Height of every item.
   *
   * @type {InputSignal<CwToggleGroupSize>}
   */
  public readonly size: InputSignal<CwToggleGroupSize> = input<CwToggleGroupSize>('default');

  /**
   * Property spacing
   * @readonly
   *
   * @description
   * 0 welds the items together; any other value spaces them by 4 px (`gap-1`).
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly spacing: InputSignalWithTransform<number, unknown> = input(0, {
    transform: numberAttribute,
  });

  /**
   * Property orientation
   * @readonly
   *
   * @description
   * Direction of the group and of its arrow keys.
   *
   * @type {InputSignal<CwToggleGroupOrientation>}
   */
  public readonly orientation: InputSignal<CwToggleGroupOrientation> =
    input<CwToggleGroupOrientation>('horizontal');

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Disables every item (Signal Forms binds it from the field).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property invalid
   * @readonly
   *
   * @description
   * Invalid state given by Signal Forms; shown once touched.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly invalid: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property touched
   * @readonly
   *
   * @description
   * Touched state given by Signal Forms.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly touched: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property required
   * @readonly
   *
   * @description
   * Required state given by Signal Forms; `aria-required` in single choice.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly required: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name of the group (« Grouper par »).
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input('');

  /**
   * Property touch
   * @readonly
   *
   * @description
   * Emitted when focus leaves the group: Signal Forms marks the field touched.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly touch: OutputEmitterRef<void> = output();

  /**
   * Property items
   * @readonly
   *
   * @description
   * Projected toggle items in content order.
   *
   * @type {Signal<readonly CwToggleGroupItem[]>}
   */
  private readonly items: Signal<readonly CwToggleGroupItem[]> = contentChildren(TOGGLE_GROUP_ITEM);

  /**
   * Property host
   * @readonly
   *
   * @description
   * Native group element used to detect focus leaving.
   *
   * @type {HTMLElement}
   */
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property dir
   * @readonly
   *
   * @description
   * Optional writing direction for keyboard navigation.
   *
   * @type {Directionality | null}
   */
  private readonly dir: Directionality | null = inject(Directionality, { optional: true });

  /**
   * Property ngControl
   * @readonly
   *
   * @description
   * Optional Angular form control using this value accessor.
   *
   * @type {NgControl | null}
   */
  private readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  /**
   * Property formDisabled
   * @readonly
   *
   * @description
   * Disabled state supplied by the form.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly formDisabled: WritableSignal<boolean> = signal(false);

  /**
   * Property accessorTouched
   * @readonly
   *
   * @description
   * Whether focus has left the group.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly accessorTouched: WritableSignal<boolean> = signal(false);

  /**
   * Property lastFocused
   * @readonly
   *
   * @description
   * Last item focused in the group.
   *
   * @type {WritableSignal<CwToggleGroupItem | null>}
   */
  private readonly lastFocused: WritableSignal<CwToggleGroupItem | null> =
    signal<CwToggleGroupItem | null>(null);

  /**
   * Property onChange
   *
   * @description
   * Registered form value-change callback.
   *
   * @type {(value: CwToggleGroupValue) => void}
   */
  private onChange: (value: CwToggleGroupValue) => void = () => undefined;

  /**
   * Property onTouched
   *
   * @description
   * Registered form touched callback.
   *
   * @type {() => void}
   */
  private onTouched: () => void = () => undefined;

  /**
   * Property keyManager
   * @readonly
   *
   * @description
   * Keyboard focus manager for toggle options.
   *
   * @type {FocusKeyManager<FocusableOption>}
   */
  private readonly keyManager: FocusKeyManager<FocusableOption> =
    new FocusKeyManager<FocusableOption>(
      computed(() => this.items().map((item) => item.keyOption)),
      inject(Injector),
    )
      .withWrap()
      .withHomeAndEnd();

  /**
   * Property isDisabled
   * @readonly
   *
   * @description
   * Whether the group disables all items.
   *
   * @type {Signal<boolean>}
   */
  public readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /**
   * Property selected
   * @readonly
   *
   * @description
   * Selected item values in either choice mode.
   *
   * @type {Signal<readonly string[]>}
   */
  public readonly selected: Signal<readonly string[]> = computed<readonly string[]>(() => {
    const value: CwToggleGroupValue = this.value();
    if (Array.isArray(value)) return value as readonly string[];
    return typeof value === 'string' ? [value] : [];
  });

  /**
   * Property tabStop
   * @readonly
   *
   * @description
   * Item receiving the roving tab stop.
   *
   * @type {Signal<CwToggleGroupItem | null>}
   */
  public readonly tabStop: Signal<CwToggleGroupItem | null> = computed(() => {
    const enabled: CwToggleGroupItem[] = this.items().filter((item) => !item.isDisabled());
    const last: CwToggleGroupItem | null = this.lastFocused();
    if (last && enabled.includes(last)) return last;
    const selected: readonly string[] = this.selected();
    return enabled.find((item) => selected.includes(item.value())) ?? enabled.at(0) ?? null;
  });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Layout classes for orientation, size and spacing.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => {
    const orientation: CwToggleGroupOrientation = this.orientation();
    if (this.spacing() > 0) return SPACED[orientation];
    return ATTACHED[orientation][this.size() === 'sm' ? 'sm' : 'other'];
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Registers the form accessor and configures keyboard orientation.
   */
  public constructor() {
    // Reactive and template-driven forms: this group is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, so the group can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    effect(() => {
      if (this.orientation() === 'vertical') {
        this.keyManager.withVerticalOrientation(true).withHorizontalOrientation(null);
      } else {
        this.keyManager
          .withVerticalOrientation(false)
          .withHorizontalOrientation(this.dir?.value === 'rtl' ? 'rtl' : 'ltr');
      }
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   * @method focus
   *
   * @description
   * Moves focus to the current tab stop.
   *
   * @param {FocusOptions} [options] - Optional browser focus behavior.
   */
  public focus(options?: FocusOptions): void {
    this.tabStop()?.focus(options);
  }

  /**
   * Method writeValue
   * @method writeValue
   *
   * @description
   * Updates selected values from a form control.
   *
   * @param {unknown} value - Selected value or values supplied by the form control.
   */
  public writeValue(value: unknown): void {
    if (Array.isArray(value)) {
      this.value.set(value.filter((entry): entry is string => typeof entry === 'string'));
    } else {
      this.value.set(typeof value === 'string' ? value : null);
    }
  }

  /**
   * Method registerOnChange
   * @method registerOnChange
   *
   * @description
   * Registers the form value-change callback.
   *
   * @param {(value: CwToggleGroupValue) => void} fn - Callback notified when the selection changes.
   */
  public registerOnChange(fn: (value: CwToggleGroupValue) => void): void {
    this.onChange = fn;
  }

  /**
   * Method registerOnTouched
   * @method registerOnTouched
   *
   * @description
   * Registers the form touched callback.
   *
   * @param {() => void} fn - Callback notified when the group is touched.
   */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Method setDisabledState
   * @method setDisabledState
   *
   * @description
   * Updates the disabled state supplied by the form.
   *
   * @param {boolean} isDisabled - Disabled state supplied by the form.
   */
  public setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /**
   * Method activate
   * @method activate
   *
   * @description
   * Selects or toggles an item according to the choice mode.
   *
   * @param {CwToggleGroupItem} item - Item to select or toggle.
   */
  public activate(item: CwToggleGroupItem): void {
    const value: string = item.value();
    let next: CwToggleGroupValue;
    if (this.type() === 'single') {
      // A radio group keeps its choice: clicking the item that is on leaves it on.
      if (this.value() === value) return;
      next = value;
    } else {
      const selected: readonly string[] = this.selected();
      next = selected.includes(value)
        ? selected.filter((entry) => entry !== value)
        : [...selected, value];
    }
    this.value.set(next);
    this.onChange(next);
  }

  /**
   * Method focused
   * @method focused
   *
   * @description
   * Tracks an item that received focus.
   *
   * @param {CwToggleGroupItem} item - Item that received focus.
   */
  public focused(item: CwToggleGroupItem): void {
    this.lastFocused.set(item);
    this.keyManager.updateActiveItem(item.keyOption);
  }

  /**
   * Method onKeydown
   * @method onKeydown
   *
   * @description
   * Navigates items and selects the focused item in single mode.
   *
   * @param {KeyboardEvent} event - Keyboard event from the group.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const before: FocusableOption | null = this.keyManager.activeItem;
    const orientation: 'horizontal' | 'vertical' =
      this.orientation() === 'vertical' ? 'vertical' : 'horizontal';
    if (ɵnavigateList(this.keyManager, event, orientation, this.dir?.value === 'rtl')) {
      event.preventDefault();
    }
    const after: FocusableOption | null = this.keyManager.activeItem;
    if (this.type() !== 'single' || !after || after === before) return;
    // Single choice follows the focus, as a native radio group does (Toggle Group sheet, "Clavier").
    const item: CwToggleGroupItem | undefined = this.items().find(
      (candidate) => candidate.keyOption === after,
    );
    if (item) this.activate(item);
  }

  /**
   * Method onFocusOut
   * @method onFocusOut
   *
   * @description
   * Marks the group touched when focus leaves it.
   *
   * @param {FocusEvent} event - Focus event used to detect departure from the group.
   */
  protected onFocusOut(event: FocusEvent): void {
    if (event.relatedTarget instanceof Node && this.host.contains(event.relatedTarget)) return;
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }

  /**
   * Method isInvalid
   * @method isInvalid
   *
   * @description
   * Determines whether touched invalid state should be shown.
   *
   * @returns {boolean} Whether the touched group should display an invalid state.
   */
  protected isInvalid(): boolean {
    if (this.invalid() && this.touched()) return true;
    const control: NgControl | null = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  }
  // #endregion
}
