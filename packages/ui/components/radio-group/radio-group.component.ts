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
import { type ControlEvent, type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import type { Observable, Subscription } from 'rxjs';

import type { CwRadioGroupItem } from './radio-group-item/radio-group-item.component';
import { RADIO_GROUP_ITEM } from './radio-group-item.token';
import type { CwRadioGroupOrientation } from './radio-group.types';

/* Literal class strings (Radio Group sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. */
/**
 * Constant ORIENTATIONS
 *
 * @description
 * Layout classes for vertical and horizontal radio groups.
 *
 * @type {Record<CwRadioGroupOrientation, string>}
 */
const ORIENTATIONS: Record<CwRadioGroupOrientation, string> = {
  vertical: 'grid gap-3',
  horizontal: 'flex flex-wrap gap-4',
};

/**
 * Constant NEXT
 *
 * @description
 * Keys advancing to the next radio option.
 *
 * @type {Set<string>}
 */
const NEXT: Set<string> = new Set<string>(['ArrowDown', 'ArrowRight']);
/**
 * Constant PREVIOUS
 *
 * @description
 * Keys returning to the previous radio option.
 *
 * @type {Set<string>}
 */
const PREVIOUS: Set<string> = new Set<string>(['ArrowUp', 'ArrowLeft']);

/**
 * Class CwRadioGroup
 * @class CwRadioGroup
 *
 * @description
 * A single choice among two to five options, all visible (Radio Group sheet of the Design System
 * artifact). More options: a Select; several choices: checkboxes.
 *
 * `role="radiogroup"` around `cw-radio-group-item` options; name it with the `legend` of its
 * fieldset (a `cw-field` label is wired through `aria-labelledby`) or `ariaLabel`. `[(value)]` is a
 * model (`valueChange` on each selection, `null` while nothing is selected); the group works with
 * Signal Forms (`[formField]`, it is a `FormValueControl<string | null>`) and with Reactive or
 * template-driven forms (it is the control's value accessor). Roving focus: Tab enters on the
 * selected option (or the first one) and leaves the group; the arrows select the next or previous
 * option, wrapping around and skipping disabled ones; Space selects the focused option.
 * `aria-invalid` is set on the group and its radios while the form control is invalid and touched.
 */
@Component({
  selector: 'cw-radio-group',
  host: {
    role: 'radiogroup',
    '[class]': 'orientationClasses()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-required]': 'required() ? "true" : null',
    '[attr.aria-invalid]': 'isInvalid() ? "true" : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '(keydown)': 'onKeydown($event)',
    '(focusout)': 'onFocusOut($event)',
  },
  templateUrl: './radio-group.component.html',
})
export class CwRadioGroup implements FormValueControl<string | null>, ControlValueAccessor {
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Value of the selected option, `null` when none is; `[(value)]`.
   *
   * @type {ModelSignal<string | null>}
   */
  public readonly value: ModelSignal<string | null> = model<string | null>(null);

  /**
   * Property orientation
   * @readonly
   *
   * @description
   * Options stacked (`gap-3`) or in a row (`gap-4`).
   *
   * @type {InputSignal<CwRadioGroupOrientation>}
   */
  public readonly orientation: InputSignal<CwRadioGroupOrientation> =
    input<CwRadioGroupOrientation>('vertical');

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Disables every option (Signal Forms binds it from the field).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property required
   * @readonly
   *
   * @description
   * A choice is required; `aria-required` (Signal Forms binds it from the field).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly required: InputSignalWithTransform<boolean, unknown> = input(false, {
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
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name when no legend or label names the group (« Visibilité »).
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
   * Property element
   * @readonly
   *
   * @description
   * Native group element used to detect focus leaving.
   *
   * @type {HTMLElement}
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property direction
   * @readonly
   *
   * @description
   * Optional writing direction for horizontal navigation.
   *
   * @type {Directionality | null}
   */
  private readonly direction: Directionality | null = inject(Directionality, { optional: true });

  /**
   * Property items
   * @readonly
   *
   * @description
   * Projected radio options in content order.
   *
   * @type {Signal<readonly CwRadioGroupItem[]>}
   */
  private readonly items: Signal<readonly CwRadioGroupItem[]> = contentChildren(RADIO_GROUP_ITEM, {
    descendants: true,
  });

  /**
   * Property ngControl
   * @readonly
   *
   * @description
   * Optional form control supplying reactive form state.
   *
   * @type {NgControl | null}
   */
  private readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  /**
   * Property formDisabled
   * @readonly
   *
   * @description
   * Disabled state supplied by the form value accessor.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly formDisabled: WritableSignal<boolean> = signal(false);

  /**
   * Property accessorTouched
   * @readonly
   *
   * @description
   * Whether focus left through the value accessor.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly accessorTouched: WritableSignal<boolean> = signal(false);

  /**
   * Property controlChanges
   * @readonly
   *
   * @description
   * Counter invalidating computed state when reactive form control events occur.
   *
   * @type {WritableSignal<number>}
   */
  private readonly controlChanges: WritableSignal<number> = signal(0);

  /**
   * Property keyManager
   * @readonly
   *
   * @description
   * Keyboard focus manager for radio options.
   *
   * @type {FocusKeyManager<FocusableOption>}
   */
  private readonly keyManager: FocusKeyManager<FocusableOption> =
    new FocusKeyManager<FocusableOption>(
      computed(() => this.items().map((item) => item.option)),
      inject(Injector),
    ).withWrap();

  /**
   * Property onChange
   *
   * @description
   * Registered form value-change callback.
   *
   * @type {(value: string | null) => void}
   */
  private onChange: (value: string | null) => void = () => undefined;

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
   * Property isDisabled
   * @readonly
   *
   * @description
   * Whether all options are disabled.
   *
   * @type {Signal<boolean>}
   */
  public readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /**
   * Property isInvalid
   * @readonly
   *
   * @description
   * Whether the group displays an invalid touched state.
   *
   * @type {Signal<boolean>}
   */
  public readonly isInvalid: Signal<boolean> = computed(() => {
    if (this.invalid() && this.touched()) return true;
    this.controlChanges();
    const control: NgControl | null = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  });

  /**
   * Property tabStop
   * @readonly
   *
   * @description
   * Selected enabled option or the first enabled option.
   *
   * @type {Signal<CwRadioGroupItem | undefined>}
   */
  public readonly tabStop: Signal<CwRadioGroupItem | undefined> = computed(() => {
    const enabled: CwRadioGroupItem[] = this.items().filter((item) => !item.isDisabled());
    return enabled.find((item) => item.value() === this.value()) ?? enabled.at(0);
  });

  /**
   * Property orientationClasses
   * @readonly
   *
   * @description
   * Layout classes for the selected orientation.
   *
   * @type {Signal<string>}
   */
  protected readonly orientationClasses: Signal<string> = computed(
    () => ORIENTATIONS[this.orientation()],
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Registers the form value accessor and observes reactive form state.
   */
  public constructor() {
    // Reactive and template-driven forms: this group is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, so the group can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    effect((onCleanup) => {
      // Signal Forms' control reads signals and has no `events` stream: it needs no subscription.
      const events: Observable<ControlEvent<unknown>> | undefined = this.ngControl?.control?.events;
      if (!events) return;
      const subscription: Subscription = events.subscribe(() => {
        this.controlChanges.update((count) => count + 1);
      });
      onCleanup(() => {
        subscription.unsubscribe();
      });
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
   * Method select
   * @method select
   *
   * @description
   * Selects an enabled option and reports the new value.
   *
   * @param {CwRadioGroupItem} item - Radio option to select when enabled.
   */
  public select(item: CwRadioGroupItem): void {
    if (item.isDisabled()) return;
    const next: string = item.value();
    if (next === this.value()) return;
    this.value.set(next);
    this.onChange(next);
  }

  /**
   * Method writeValue
   * @method writeValue
   *
   * @description
   * Updates the selected value from a form control.
   *
   * @param {unknown} value - Value supplied by the form control.
   */
  public writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' ? value : null);
  }

  /**
   * Method registerOnChange
   * @method registerOnChange
   *
   * @description
   * Registers the form value-change callback.
   *
   * @param {(value: string | null) => void} fn - Callback notified when the selection changes.
   */
  public registerOnChange(fn: (value: string | null) => void): void {
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
   * Method onKeydown
   * @method onKeydown
   *
   * @description
   * Moves and selects an enabled option using arrow keys.
   *
   * @param {KeyboardEvent} event - Keyboard event from the group.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const rtl: boolean = this.direction?.value === 'rtl';
    const horizontal: boolean = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
    let forward: boolean = NEXT.has(event.key);
    if (!forward && !PREVIOUS.has(event.key)) return;
    if (rtl && horizontal) forward = !forward;

    const items: readonly CwRadioGroupItem[] = this.items();
    const current: number = items.findIndex((item) => item.hasFocus());
    if (current < 0) return;
    event.preventDefault();
    // The key manager owns the wrap and skips the disabled options; the focus selects.
    this.keyManager.updateActiveItem(current);
    if (forward) this.keyManager.setNextItemActive();
    else this.keyManager.setPreviousItemActive();
    const active: CwRadioGroupItem | undefined = items.at(this.keyManager.activeItemIndex ?? -1);
    if (active) this.select(active);
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
    const next: EventTarget | null = event.relatedTarget;
    if (next instanceof Node && this.element.contains(next)) return;
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }
  // #endregion
}
