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
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckBold, phosphorMinusBold } from '@ng-icons/phosphor-icons/bold';

/**
 * Class CwCheckbox
 * @class CwCheckbox
 *
 * @description
 * A box to tick: an option of a form, a row of a list, "select all" in a list header (Checkbox
 * sheet of the Design System artifact).
 *
 * Renders a 16 px `button role="checkbox"`; checked or indeterminate in ink with a 12 px check or
 * minus, unchecked with a `line-control` border. `[(checked)]` and `[(indeterminate)]` are models;
 * the box works with Signal Forms (`[formField]`, it is a `FormCheckboxControl`) and with Reactive
 * or template-driven forms (`formControlName`, `[formControl]`, `ngModel`: it is the control's value
 * accessor). `aria-invalid` is set when the form control is invalid and touched. Name it with a
 * `<label for>` (its `id`) or `ariaLabel`. Ticking clears `indeterminate`.
 */
@Component({
  selector: 'cw-checkbox',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorCheckBold, phosphorMinusBold })],
  host: {
    class: 'inline-flex',
    '[attr.id]': 'null',
  },
  templateUrl: './checkbox.component.html',
})
export class CwCheckbox implements FormCheckboxControl, ControlValueAccessor {
  // #region Properties
  /**
   * Property checked
   * @readonly
   *
   * @description
   * Two-way model indicating whether the box is checked.
   *
   * @type {ModelSignal<boolean>}
   * @default false
   */
  public readonly checked: ModelSignal<boolean> = model(false);

  /**
   * Property indeterminate
   * @readonly
   *
   * @description
   * Two-way mixed-state model used for partial selections and exposed as `aria-checked="mixed"`.
   *
   * @type {ModelSignal<boolean>}
   * @default false
   */
  public readonly indeterminate: ModelSignal<boolean> = model(false);

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
   * Signal Forms invalid state, displayed as invalid after the field is touched.
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
   * Inner button identifier for a native label; generated when not supplied by the consumer.
   *
   * @type {InputSignal<string>}
   */
  public readonly id: InputSignal<string> = input(inject(_IdGenerator).getId('cw-checkbox-'));

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name used when no native label points at the checkbox.
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
   * Emits when focus leaves the checkbox so Signal Forms can mark its field touched.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly touch: OutputEmitterRef<void> = output();

  /**
   * Property box
   * @readonly
   *
   * @description
   * Required query for the native checkbox button, used by the focus method.
   *
   * @type {Signal<ElementRef<HTMLButtonElement>>}
   */
  private readonly box: Signal<ElementRef<HTMLButtonElement>> =
    viewChild.required<ElementRef<HTMLButtonElement>>('box');

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
   * Form callback notified when the checkbox is touched; initially a no-op.
   *
   * @type {() => void}
   */
  private onTouched: () => void = () => undefined;

  /**
   * Property isDisabled
   * @readonly
   *
   * @description
   * Combined disabled state from the input and form value accessor.
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
   * Current visual state, prioritizing indeterminate over checked and unchecked.
   *
   * @type {Signal<'indeterminate' | 'checked' | 'unchecked'>}
   */
  protected readonly state: Signal<'indeterminate' | 'checked' | 'unchecked'> = computed(() =>
    this.indeterminate() ? 'indeterminate' : this.checked() ? 'checked' : 'unchecked',
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
    // Reactive and template-driven forms: this box is the control's value accessor. Set here rather
    // than through NG_VALUE_ACCESSOR, so the box can read the control's validity for aria-invalid.
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   * @method focus
   *
   * @description
   * Moves focus to the native checkbox button, including when Signal Forms focuses an invalid field.
   *
   * @param {FocusOptions} [options] - Optional native focus behavior.
   */
  public focus(options?: FocusOptions): void {
    this.box().nativeElement.focus(options);
  }

  /**
   * Method writeValue
   * @method writeValue
   *
   * @description
   * Applies a form value to the checked model; only the boolean value true checks the box.
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
   * Stores the form callback invoked when the checkbox loses focus.
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
   * Clears mixed state, updates the checked model and notifies the registered form change callback.
   */
  protected toggle(): void {
    const next: boolean = this.indeterminate() ? true : !this.checked();
    this.indeterminate.set(false);
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
