import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCheckBold, phosphorMinusBold } from '@ng-icons/phosphor-icons/bold';

/**
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex',
    '[attr.id]': 'null',
  },
  templateUrl: './checkbox.component.html',
})
export class CwCheckbox implements FormCheckboxControl, ControlValueAccessor {
  /** Whether the box is ticked; `[(checked)]`. */
  readonly checked = model(false);
  /** Mixed state, for "select all" over a partial selection; `aria-checked="mixed"`. */
  readonly indeterminate = model(false);
  /** Disables the box (Signal Forms binds it from the field). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Invalid state given by Signal Forms; shown once touched. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Touched state given by Signal Forms. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Required state given by Signal Forms; `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Id of the inner button, for `<label for>`; generated when not given. */
  readonly id = input(inject(_IdGenerator).getId('cw-checkbox-'));
  /** Accessible name when no label points at the box (« Sélectionner CAD-482 »). */
  readonly ariaLabel = input('');
  /** Emitted when focus leaves the box: Signal Forms marks the field touched. */
  readonly touch = output();

  private readonly box = viewChild.required<ElementRef<HTMLButtonElement>>('box');
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly formDisabled = signal(false);
  private readonly accessorTouched = signal(false);
  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly state = computed(() =>
    this.indeterminate() ? 'indeterminate' : this.checked() ? 'checked' : 'unchecked',
  );

  constructor() {
    // Reactive and template-driven forms: this box is the control's value accessor. Set here rather
    // than through NG_VALUE_ACCESSOR, so the box can read the control's validity for aria-invalid.
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  /** Moves the focus to the box (Signal Forms calls it to focus the first invalid field). */
  focus(options?: FocusOptions): void {
    this.box().nativeElement.focus(options);
  }

  writeValue(value: unknown): void {
    this.checked.set(value === true);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected isInvalid(): boolean {
    if (this.invalid() && this.touched()) return true;
    const control = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  }

  protected toggle(): void {
    const next = this.indeterminate() ? true : !this.checked();
    this.indeterminate.set(false);
    this.checked.set(next);
    this.onChange(next);
  }

  protected markTouched(): void {
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }
}
