import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormCheckboxControl } from '@angular/forms/signals';

import type { CwSwitchSize } from './switch.types';

/**
 * Constant TRACK
 *
 * @description
 * Literal Switch sheet track, interaction and focus classes; a disabled parent field is not dimmed twice.
 *
 * @type {string}
 */
const TRACK: string =
  'peer inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 group-data-[disabled=true]/field:disabled:opacity-100 aria-invalid:ring-1 aria-invalid:ring-destructive data-[state=checked]:bg-foreground data-[state=unchecked]:bg-line-control motion-reduce:transition-none';

/**
 * Constant THUMB
 *
 * @description
 * Literal thumb movement and color classes, including the dark-theme unchecked contrast.
 *
 * @type {string}
 */
const THUMB: string =
  'pointer-events-none block rounded-full bg-background transition-transform duration-200 ease-snap motion-reduce:transition-none data-[state=unchecked]:translate-x-0 dark:data-[state=unchecked]:bg-foreground';

/**
 * Constant SIZES
 *
 * @description
 * Track dimensions and thumb dimensions and translation for each switch size.
 *
 * @type {Record<CwSwitchSize, { track: string; thumb: string }>}
 */
const SIZES: Record<CwSwitchSize, { track: string; thumb: string }> = {
  default: { track: 'h-5 w-9', thumb: 'size-4 data-[state=checked]:translate-x-4' },
  sm: { track: 'h-4 w-7', thumb: 'size-3 data-[state=checked]:translate-x-3' },
};

/**
 * Class CwSwitch
 * @class CwSwitch
 *
 * @description
 * A switch with an immediate effect: turns a setting on or off without a Save button (Switch sheet
 * of the Design System artifact). In a form validated by a button, use a checkbox.
 *
 * Renders a `button role="switch"`: on, an ink track with the knob on the right; off, a
 * `line-control` track. `[(checked)]` is a model (`checkedChange` on each toggle); the switch works
 * with Signal Forms (`[formField]`, it is a `FormCheckboxControl`) and with Reactive or
 * template-driven forms (`formControlName`, `[formControl]`, `ngModel`: it is the control's value
 * accessor). `aria-invalid` is set when the form control is invalid and touched: when the effect
 * fails, restore the previous state, mark it invalid and announce the message. Name it with a
 * `<label for>` (its `id`) or `ariaLabel`. Space and Enter toggle it; the knob slides in 200 ms,
 * instantly under reduced motion.
 */
@Component({
  selector: 'cw-switch',
  host: {
    class: 'inline-flex',
    '[attr.id]': 'null',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './switch.component.html',
})
export class CwSwitch implements FormCheckboxControl, ControlValueAccessor {
  // #region Properties
  /**
   * Property checked
   * @readonly
   *
   * @description
   * Two-way model of the switch state; toggling emits `checkedChange`.
   *
   * @type {ModelSignal<boolean>}
   * @default false
   */
  public readonly checked: ModelSignal<boolean> = model(false);

  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting standard settings dimensions or small dimensions for dense rows.
   *
   * @type {InputSignal<CwSwitchSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwSwitchSize> = input<CwSwitchSize>('default');

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Input disabling interaction; Signal Forms may bind it from a field.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property invalid
   * @readonly
   *
   * @description
   * Signal Forms invalid state; displayed as invalid once the field is touched.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly invalid: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property touched
   * @readonly
   *
   * @description
   * Touched state supplied by Signal Forms.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly touched: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property required
   * @readonly
   *
   * @description
   * Required state supplied by Signal Forms and reflected in `aria-required`.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly required: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property id
   * @readonly
   *
   * @description
   * Inner button identifier for a native label; generated when the consumer does not provide one.
   *
   * @type {InputSignal<string>}
   */
  public readonly id: InputSignal<string> = input(inject(_IdGenerator).getId('cw-switch-'));

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name used when no native label points at the switch.
   *
   * @type {InputSignal<string>}
   * @default ''
   */
  public readonly ariaLabel: InputSignal<string> = input('');

  /**
   * Property touch
   * @readonly
   *
   * @description
   * Emits when focus leaves the switch so Signal Forms can mark its field touched.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly touch: OutputEmitterRef<void> = output();

  /**
   * Property track
   * @readonly
   *
   * @description
   * Required query for the native switch button, used by the focus method.
   *
   * @type {Signal<ElementRef<HTMLButtonElement>>}
   */
  private readonly track: Signal<ElementRef<HTMLButtonElement>> =
    viewChild.required<ElementRef<HTMLButtonElement>>('track');

  /**
   * Property ngControl
   * @readonly
   *
   * @description
   * Angular form control on the host, or null when no reactive or template-driven control is bound.
   *
   * @type {NgControl | null}
   */
  private readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  /**
   * Property formDisabled
   * @readonly
   *
   * @description
   * Disabled state supplied through the ControlValueAccessor contract.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  private readonly formDisabled: WritableSignal<boolean> = signal(false);

  /**
   * Property accessorTouched
   * @readonly
   *
   * @description
   * Records touch through the value accessor when checking the bound control's invalid state.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  private readonly accessorTouched: WritableSignal<boolean> = signal(false);

  /**
   * Property onChange
   *
   * @description
   * Form callback notified with a new checked value; initially a no-op.
   *
   * @type {(value: boolean) => void}
   */
  private onChange: (value: boolean) => void = () => undefined;

  /**
   * Property onTouched
   *
   * @description
   * Form callback notified when the switch is touched; initially a no-op.
   *
   * @type {() => void}
   */
  private onTouched: () => void = () => undefined;

  /**
   * Property isDisabled
   * @readonly
   *
   * @description
   * Combined disabled state from the input and the form value accessor.
   *
   * @type {Signal<boolean>}
   */
  protected readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /**
   * Property state
   * @readonly
   *
   * @description
   * Checked or unchecked state exposed to the track and thumb styling.
   *
   * @type {Signal<'checked' | 'unchecked'>}
   */
  protected readonly state: Signal<'checked' | 'unchecked'> = computed(() =>
    this.checked() ? 'checked' : 'unchecked',
  );

  /**
   * Property trackClasses
   * @readonly
   *
   * @description
   * Track classes combined with the dimensions for the selected size.
   *
   * @type {Signal<string>}
   */
  protected readonly trackClasses: Signal<string> = computed(
    () => `${TRACK} ${SIZES[this.size()].track}`,
  );

  /**
   * Property thumbClasses
   * @readonly
   *
   * @description
   * Thumb classes combined with dimensions and translation for the selected size.
   *
   * @type {Signal<string>}
   */
  protected readonly thumbClasses: Signal<string> = computed(
    () => `${THUMB} ${SIZES[this.size()].thumb}`,
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Registers this component as the bound Angular control's value accessor when one exists.
   */
  public constructor() {
    // Reactive and template-driven forms: this switch is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, so the switch can read the control's validity for
    // aria-invalid.
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   * @method focus
   *
   * @description
   * Moves focus to the native switch button, including when Signal Forms focuses an invalid field.
   *
   * @param {FocusOptions} [options] - Optional native focus behavior.
   */
  public focus(options?: FocusOptions): void {
    this.track().nativeElement.focus(options);
  }

  /**
   * Method writeValue
   * @method writeValue
   *
   * @description
   * Applies a form value to the model; only the boolean value true checks the switch.
   *
   * @param {unknown} value - Value supplied by the form control.
   */
  public writeValue(value: unknown): void {
    this.checked.set(value === true);
  }

  /**
   * Method registerOnChange
   * @method registerOnChange
   *
   * @description
   * Stores the form callback invoked when user interaction changes the checked value.
   *
   * @param {(value: boolean) => void} fn - Callback registered by Angular Forms.
   */
  public registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  /**
   * Method registerOnTouched
   * @method registerOnTouched
   *
   * @description
   * Stores the form callback invoked when the switch loses focus.
   *
   * @param {() => void} fn - Callback registered by Angular Forms.
   */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Method setDisabledState
   * @method setDisabledState
   *
   * @description
   * Updates the disabled state requested by the bound form control.
   *
   * @param {boolean} isDisabled - Whether the form disables interaction.
   */
  public setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /**
   * Method isInvalid
   * @method isInvalid
   *
   * @description
   * Combines touched invalid state from Signal Forms or the bound Angular form control.
   *
   * @returns {boolean} Whether an invalid state should be exposed on the button.
   */
  protected isInvalid(): boolean {
    if (this.invalid() && this.touched()) return true;
    const control: NgControl | null = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  }

  /**
   * Method toggle
   * @method toggle
   *
   * @description
   * Flips the model and notifies the registered form change callback.
   */
  protected toggle(): void {
    const next: boolean = !this.checked();
    this.checked.set(next);
    this.onChange(next);
  }

  /**
   * Method markTouched
   * @method markTouched
   *
   * @description
   * Records touch, invokes the form callback and emits the Signal Forms touch event.
   */
  protected markTouched(): void {
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }
  // #endregion
}
