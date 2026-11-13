import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';

import type { CwInputOtpCharset } from './input-otp.types';

/* Keeps the accepted characters only, upper-cased for a recovery code, at most `length` of them. */
function clean(raw: string, charset: CwInputOtpCharset, length: number): string {
  const kept =
    charset === 'digits'
      ? raw.replace(/[^0-9]/g, '')
      : raw.replace(/[^0-9a-z]/gi, '').toUpperCase();
  return kept.slice(0, length);
}

/**
 * A one-time code typed box by box: two-factor sign-in, a code received by e-mail, a recovery code
 * (Input OTP sheet of the Design System artifact).
 *
 * One real native `<input>` carries the value, the focus and `autocomplete="one-time-code"`; it lies
 * transparent over the boxes, so typing, pasting and autofill work as on any field. Project
 * `cw-input-otp-group`, `cw-input-otp-slot` (one per character, with its `index`) and
 * `cw-input-otp-separator`; the boxes only render the value and are hidden from assistive
 * technologies. An accepted character fills the active box and moves on, a typed character over a
 * filled box replaces it, Backspace clears the previous box, ← → Home End move the active box, a
 * paste keeps the accepted characters only. `complete` emits the code once every box is filled.
 *
 * `[(value)]` is a model; the field works with Signal Forms (`[formField]`, it is a
 * `FormValueControl<string>`) and with Reactive or template-driven forms (it is the control's value
 * accessor). `aria-invalid` is set on the input when the control is invalid and the user typed or
 * left the field. Name it with `ariaLabel`, or a `<label for>` pointing at `id`; link the help and
 * the error text with `ariaDescribedBy`. Style hooks: `data-disabled`, `data-invalid` on the host.
 */
@Component({
  selector: 'cw-input-otp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'relative flex w-fit items-center gap-2 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    '[attr.id]': 'null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
  },
  templateUrl: './input-otp.component.html',
})
export class CwInputOtp implements FormValueControl<string>, ControlValueAccessor {
  /** Number of characters, hence of boxes (6 for a TOTP code, 8 for a recovery code). */
  readonly length = input(6, { transform: numberAttribute });
  /** Accepted characters; `alphanumeric` upper-cases what is typed. */
  readonly charset = input<CwInputOtpCharset>('digits');
  /** The code typed so far; `[(value)]`, emits `valueChange` on every keystroke. */
  readonly value = model('');
  /** Disables the field (Signal Forms binds it from the field), after too many attempts for example. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Invalid state, given by Signal Forms or by the consumer after a rejected code. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Touched state given by Signal Forms. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Required state given by Signal Forms; `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Accessible name of the input; set it to the visible label's text, or empty with a `<label for>`. */
  readonly ariaLabel = input('Code à usage unique');
  /** Ids of the help and error texts, for `aria-describedby`. */
  readonly ariaDescribedBy = input('');
  /** Id of the native input, for `<label for>`; generated when not given. */
  readonly id = input(inject(_IdGenerator).getId('cw-input-otp-'));
  /** Emits the code once every box is filled (an automatic submission may follow). */
  readonly complete = output<string>();
  /** Emitted when focus leaves the field: Signal Forms marks the field touched. */
  readonly touch = output();

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly formDisabled = signal(false);
  private readonly accessorTouched = signal(false);
  private readonly typed = signal(false);
  private readonly focused = signal(false);
  private readonly caret = signal(0);
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** @internal Whether the boxes show the error: invalid, once the user typed or left the field. */
  readonly showInvalid = computed(() => {
    const shown = this.touched() || this.accessorTouched() || this.typed();
    if (this.invalid() && shown) return true;
    const control = this.ngControl;
    return !!control && control.invalid === true && (shown || control.touched === true);
  });

  /** @internal Index of the box under the caret while the field has the focus, else -1. */
  readonly activeIndex = computed(() => {
    if (!this.focused()) return -1;
    return Math.min(this.caret(), this.value().length, this.length() - 1);
  });

  constructor() {
    // Reactive and template-driven forms: this field is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, so the field can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  /** Moves the focus to the field (Signal Forms calls it to focus the first invalid field). */
  focus(options?: FocusOptions): void {
    this.field().nativeElement.focus(options);
  }

  writeValue(value: unknown): void {
    this.value.set(clean(typeof value === 'string' ? value : '', this.charset(), this.length()));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected onBeforeInput(event: InputEvent): void {
    if (event.inputType !== 'insertText' || !event.data) return;
    // A typed character replaces the box under the caret instead of being inserted before it, and a
    // refused character never reaches the input (Input OTP sheet, "Clavier").
    event.preventDefault();
    const typed = clean(event.data, this.charset(), this.length());
    if (!typed) return;
    const element = this.field().nativeElement;
    const current = this.value();
    // On a full code the caret stands after the last box, which is the active one: replace it.
    const at = Math.min(
      element.selectionStart ?? current.length,
      current.length,
      this.length() - 1,
    );
    const next = (current.slice(0, at) + typed + current.slice(at + typed.length)).slice(
      0,
      this.length(),
    );
    this.commit(next, Math.min(at + typed.length, this.length()));
  }

  protected onInput(): void {
    // Autofill, deletion and composition reach the field as plain input: keep the accepted part.
    const element = this.field().nativeElement;
    const next = clean(element.value, this.charset(), this.length());
    const caret = Math.min(element.selectionStart ?? next.length, next.length);
    this.commit(next, caret);
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = clean(event.clipboardData?.getData('text') ?? '', this.charset(), this.length());
    if (pasted) this.commit(pasted, pasted.length);
  }

  protected onFocus(): void {
    this.focused.set(true);
    this.toEnd();
  }

  protected toEnd(): void {
    // The text of the transparent input does not line up with the boxes: a click or the focus puts
    // the caret after the last character, as the active box shows.
    const end = this.value().length;
    this.field().nativeElement.setSelectionRange(end, end);
    this.caret.set(end);
  }

  protected syncCaret(): void {
    this.caret.set(this.field().nativeElement.selectionStart ?? this.value().length);
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }

  private commit(next: string, caret: number): void {
    const element = this.field().nativeElement;
    element.value = next;
    element.setSelectionRange(caret, caret);
    this.caret.set(caret);
    if (next === this.value()) return;
    this.typed.set(true);
    this.value.set(next);
    this.onChange(next);
    if (next.length === this.length()) this.complete.emit(next);
  }
}
