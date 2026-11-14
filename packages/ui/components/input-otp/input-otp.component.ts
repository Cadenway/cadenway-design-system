import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
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
import type { FormValueControl } from '@angular/forms/signals';

import type { CwInputOtpCharset } from './input-otp.types';

/* Keeps the accepted characters only, upper-cased for a recovery code, at most `length` of them. */
/**
 * Function clean
 *
 * @description
 * Filters and truncates a code according to its accepted character set.
 *
 * @param {string} raw - Code text to normalize.
 * @param {CwInputOtpCharset} charset - Accepted character set.
 * @param {number} length - Maximum number of characters to retain.
 *
 * @returns {string} Filtered and truncated code.
 */
function clean(raw: string, charset: CwInputOtpCharset, length: number): string {
  const kept: string =
    charset === 'digits'
      ? raw.replace(/[^0-9]/g, '')
      : raw.replace(/[^0-9a-z]/gi, '').toUpperCase();
  return kept.slice(0, length);
}

/**
 * Class CwInputOtp
 * @class CwInputOtp
 *
 * @description
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
  // #region Properties
  /**
   * Property length
   * @readonly
   *
   * @description
   * Number of characters, hence of boxes (6 for a TOTP code, 8 for a recovery code).
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly length: InputSignalWithTransform<number, unknown> = input(6, {
    transform: numberAttribute,
  });

  /**
   * Property charset
   * @readonly
   *
   * @description
   * Accepted characters; `alphanumeric` upper-cases what is typed.
   *
   * @type {InputSignal<CwInputOtpCharset>}
   */
  public readonly charset: InputSignal<CwInputOtpCharset> = input<CwInputOtpCharset>('digits');

  /**
   * Property value
   * @readonly
   *
   * @description
   * The code typed so far; `[(value)]`, emits `valueChange` on every keystroke.
   *
   * @type {ModelSignal<string>}
   */
  public readonly value: ModelSignal<string> = model('');

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Disables the field (Signal Forms binds it from the field), after too many attempts for example.
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
   * Invalid state, given by Signal Forms or by the consumer after a rejected code.
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
   * Required state given by Signal Forms; `aria-required`.
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
   * Accessible name of the input; set it to the visible label's text, or empty with a `<label for>`.
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input('Code à usage unique');

  /**
   * Property ariaDescribedBy
   * @readonly
   *
   * @description
   * Ids of the help and error texts, for `aria-describedby`.
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaDescribedBy: InputSignal<string> = input('');

  /**
   * Property id
   * @readonly
   *
   * @description
   * Id of the native input, for `<label for>`; generated when not given.
   *
   * @type {InputSignal<string>}
   */
  public readonly id: InputSignal<string> = input(inject(_IdGenerator).getId('cw-input-otp-'));

  /**
   * Property complete
   * @readonly
   *
   * @description
   * Emits the code once every box is filled (an automatic submission may follow).
   *
   * @type {OutputEmitterRef<string>}
   */
  public readonly complete: OutputEmitterRef<string> = output<string>();

  /**
   * Property touch
   * @readonly
   *
   * @description
   * Emitted when focus leaves the field: Signal Forms marks the field touched.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly touch: OutputEmitterRef<void> = output();

  /**
   * Property field
   * @readonly
   *
   * @description
   * Native input carrying the code and focus.
   *
   * @type {Signal<ElementRef<HTMLInputElement>>}
   */
  private readonly field: Signal<ElementRef<HTMLInputElement>> =
    viewChild.required<ElementRef<HTMLInputElement>>('field');

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
   * Whether the field has been blurred.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly accessorTouched: WritableSignal<boolean> = signal(false);

  /**
   * Property typed
   * @readonly
   *
   * @description
   * Whether the user has changed the code.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly typed: WritableSignal<boolean> = signal(false);

  /**
   * Property focused
   * @readonly
   *
   * @description
   * Whether the native input has focus.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly focused: WritableSignal<boolean> = signal(false);

  /**
   * Property caret
   * @readonly
   *
   * @description
   * Current caret position.
   *
   * @type {WritableSignal<number>}
   */
  private readonly caret: WritableSignal<number> = signal(0);

  /**
   * Property onChange
   *
   * @description
   * Registered form value-change callback.
   *
   * @type {(value: string) => void}
   */
  private onChange: (value: string) => void = () => undefined;

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
   * Whether the field is disabled by input or form.
   *
   * @type {Signal<boolean>}
   */
  protected readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /**
   * Property showInvalid
   * @readonly
   *
   * @description
   * Whether the invalid state should be shown after interaction.
   *
   * @type {Signal<boolean>}
   */
  public readonly showInvalid: Signal<boolean> = computed(() => {
    const shown: boolean = this.touched() || this.accessorTouched() || this.typed();
    if (this.invalid() && shown) return true;
    const control: NgControl | null = this.ngControl;
    return !!control && control.invalid === true && (shown || control.touched === true);
  });

  /**
   * Property activeIndex
   * @readonly
   *
   * @description
   * Focused box index, or minus one when unfocused.
   *
   * @type {Signal<number>}
   */
  public readonly activeIndex: Signal<number> = computed(() => {
    if (!this.focused()) return -1;
    return Math.min(this.caret(), this.value().length, this.length() - 1);
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Registers the native field as the form value accessor when present.
   */
  public constructor() {
    // Reactive and template-driven forms: this field is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, so the field can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   * @method focus
   *
   * @description
   * Moves focus to the native input.
   *
   * @param {FocusOptions} [options] - Optional browser focus behavior.
   */
  public focus(options?: FocusOptions): void {
    this.field().nativeElement.focus(options);
  }

  /**
   * Method writeValue
   * @method writeValue
   *
   * @description
   * Normalizes and sets a value received from the form.
   *
   * @param {unknown} value - Value supplied by the form control.
   */
  public writeValue(value: unknown): void {
    this.value.set(clean(typeof value === 'string' ? value : '', this.charset(), this.length()));
  }

  /**
   * Method registerOnChange
   * @method registerOnChange
   *
   * @description
   * Registers the form value-change callback.
   *
   * @param {(value: string) => void} fn - Callback notified when the code changes.
   */
  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /**
   * Method registerOnTouched
   * @method registerOnTouched
   *
   * @description
   * Registers the form touched callback.
   *
   * @param {() => void} fn - Callback notified when the field is touched.
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
   * Method onBeforeInput
   * @method onBeforeInput
   *
   * @description
   * Replaces the active code character with accepted input.
   *
   * @param {InputEvent} event - Input event describing the typed character.
   */
  protected onBeforeInput(event: InputEvent): void {
    if (event.inputType !== 'insertText' || !event.data) return;
    // A typed character replaces the box under the caret instead of being inserted before it, and a
    // refused character never reaches the input (Input OTP sheet, "Clavier").
    event.preventDefault();
    const typed: string = clean(event.data, this.charset(), this.length());
    if (!typed) return;
    const element: HTMLInputElement = this.field().nativeElement;
    const current: string = this.value();
    // On a full code the caret stands after the last box, which is the active one: replace it.
    const at: number = Math.min(
      element.selectionStart ?? current.length,
      current.length,
      this.length() - 1,
    );
    const next: string = (current.slice(0, at) + typed + current.slice(at + typed.length)).slice(
      0,
      this.length(),
    );
    this.commit(next, Math.min(at + typed.length, this.length()));
  }

  /**
   * Method onInput
   * @method onInput
   *
   * @description
   * Normalizes values supplied by autofill, deletion or composition.
   */
  protected onInput(): void {
    // Autofill, deletion and composition reach the field as plain input: keep the accepted part.
    const element: HTMLInputElement = this.field().nativeElement;
    const next: string = clean(element.value, this.charset(), this.length());
    const caret: number = Math.min(element.selectionStart ?? next.length, next.length);
    this.commit(next, caret);
  }

  /**
   * Method onPaste
   * @method onPaste
   *
   * @description
   * Accepts and normalizes pasted code text.
   *
   * @param {ClipboardEvent} event - Clipboard event containing the pasted text.
   */
  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted: string = clean(
      event.clipboardData?.getData('text') ?? '',
      this.charset(),
      this.length(),
    );
    if (pasted) this.commit(pasted, pasted.length);
  }

  /**
   * Method onFocus
   * @method onFocus
   *
   * @description
   * Tracks focus and moves the caret to the end.
   */
  protected onFocus(): void {
    this.focused.set(true);
    this.toEnd();
  }

  /**
   * Method toEnd
   * @method toEnd
   *
   * @description
   * Moves the caret after the last character.
   */
  protected toEnd(): void {
    // The text of the transparent input does not line up with the boxes: a click or the focus puts
    // the caret after the last character, as the active box shows.
    const end: number = this.value().length;
    this.field().nativeElement.setSelectionRange(end, end);
    this.caret.set(end);
  }

  /**
   * Method syncCaret
   * @method syncCaret
   *
   * @description
   * Synchronizes the active box with the native caret.
   */
  protected syncCaret(): void {
    this.caret.set(this.field().nativeElement.selectionStart ?? this.value().length);
  }

  /**
   * Method onBlur
   * @method onBlur
   *
   * @description
   * Marks the form control touched when focus leaves.
   */
  protected onBlur(): void {
    this.focused.set(false);
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }

  /**
   * Method commit
   * @method commit
   *
   * @description
   * Writes a changed code, reports it and emits completion when full.
   *
   * @param {string} next - Normalized code to commit.
   * @param {number} caret - Caret position after the update.
   */
  private commit(next: string, caret: number): void {
    const element: HTMLInputElement = this.field().nativeElement;
    element.value = next;
    element.setSelectionRange(caret, caret);
    this.caret.set(caret);
    if (next === this.value()) return;
    this.typed.set(true);
    this.value.set(next);
    this.onChange(next);
    if (next.length === this.length()) this.complete.emit(next);
  }
  // #endregion
}
