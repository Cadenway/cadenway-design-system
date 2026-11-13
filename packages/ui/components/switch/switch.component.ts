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
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormCheckboxControl } from '@angular/forms/signals';

import type { CwSwitchSize } from './switch.types';

/* Literal class strings (Switch sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. Off, the track is `line-control`; on, it is ink. In dark the knob of
   an off switch turns ink to stay readable on the track. Inside a disabled `cw-field` the field is
   already at 50 %. */
const TRACK =
  'peer inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 group-data-[disabled=true]/field:disabled:opacity-100 aria-invalid:ring-1 aria-invalid:ring-destructive data-[state=checked]:bg-foreground data-[state=unchecked]:bg-line-control motion-reduce:transition-none';

const THUMB =
  'pointer-events-none block rounded-full bg-background transition-transform duration-200 ease-snap motion-reduce:transition-none data-[state=unchecked]:translate-x-0 dark:data-[state=unchecked]:bg-foreground';

const SIZES: Record<CwSwitchSize, { track: string; thumb: string }> = {
  default: { track: 'h-5 w-9', thumb: 'size-4 data-[state=checked]:translate-x-4' },
  sm: { track: 'h-4 w-7', thumb: 'size-3 data-[state=checked]:translate-x-3' },
};

/**
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
  /** Whether the switch is on; `[(checked)]`, `checkedChange` on each toggle. */
  readonly checked = model(false);
  /** `default` for settings and forms, `sm` for dense rows and menus. */
  readonly size = input<CwSwitchSize>('default');
  /** Disables the switch (Signal Forms binds it from the field). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Invalid state given by Signal Forms; shown once touched. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Touched state given by Signal Forms. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Required state given by Signal Forms; `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Id of the inner button, for `<label for>`; generated when not given. */
  readonly id = input(inject(_IdGenerator).getId('cw-switch-'));
  /** Accessible name when no label points at the switch (« Notifications par e-mail »). */
  readonly ariaLabel = input('');
  /** Emitted when focus leaves the switch: Signal Forms marks the field touched. */
  readonly touch = output();

  private readonly track = viewChild.required<ElementRef<HTMLButtonElement>>('track');
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly formDisabled = signal(false);
  private readonly accessorTouched = signal(false);
  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly state = computed(() => (this.checked() ? 'checked' : 'unchecked'));
  protected readonly trackClasses = computed(() => `${TRACK} ${SIZES[this.size()].track}`);
  protected readonly thumbClasses = computed(() => `${THUMB} ${SIZES[this.size()].thumb}`);

  constructor() {
    // Reactive and template-driven forms: this switch is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, so the switch can read the control's validity for
    // aria-invalid.
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  /** Moves the focus to the switch (Signal Forms calls it to focus the first invalid field). */
  focus(options?: FocusOptions): void {
    this.track().nativeElement.focus(options);
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
    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
  }

  protected markTouched(): void {
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }
}
