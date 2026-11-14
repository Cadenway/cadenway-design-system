import {
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';

import { CwInputOtp } from '../input-otp.component';

/**
 * Constant SLOT_BASE
 *
 * @description
 * Literal layout and border classes shared by code boxes.
 *
 * @type {string}
 */
const SLOT_BASE: string =
  'relative flex size-8 items-center justify-center border-y border-r text-sm font-medium tabular-nums transition-[color,box-shadow] motion-reduce:transition-none first:rounded-l-lg first:border-l last:rounded-r-lg';

/**
 * Constant SLOT_BORDER
 *
 * @description
 * Border classes for valid and invalid fields.
 *
 * @type {{ readonly valid: 'border-input'; readonly invalid: 'border-destructive/60' }}
 */
const SLOT_BORDER: { readonly valid: 'border-input'; readonly invalid: 'border-destructive/60' } = {
  valid: 'border-input',
  invalid: 'border-destructive/60',
} as const;

/**
 * Constant SLOT_ACTIVE
 *
 * @description
 * Focus ring classes for the active code box.
 *
 * @type {string}
 */
const SLOT_ACTIVE: string = 'z-10 ring-2 ring-ring ring-offset-2 ring-offset-background';

/**
 * Class CwInputOtpSlot
 * @class CwInputOtpSlot
 *
 * @description
 * One box of `cw-input-otp`: shows the character at its `index`, the focus ring when it is the
 * active box, and a blinking caret when that box is empty (still under reduced motion).
 *
 * Decorative (`aria-hidden`): the native input of the field carries the value. Style hooks:
 * `data-active`, `data-filled`.
 */
@Component({
  selector: 'cw-input-otp-slot',
  host: {
    'aria-hidden': 'true',
    '[class]': 'classes()',
    '[attr.data-active]': 'active() ? "" : null',
    '[attr.data-filled]': 'char() ? "" : null',
  },
  templateUrl: './input-otp-slot.component.html',
})
export class CwInputOtpSlot {
  // #region Properties
  /**
   * Property index
   * @readonly
   *
   * @description
   * Zero-based position of the box in the code.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly index: InputSignalWithTransform<number, unknown> = input.required({
    transform: numberAttribute,
  });

  /**
   * Property otp
   * @readonly
   *
   * @description
   * Parent field supplying the code and active position.
   *
   * @type {CwInputOtp}
   */
  private readonly otp: CwInputOtp = inject(CwInputOtp);

  /**
   * Property char
   * @readonly
   *
   * @description
   * Code character shown in this box.
   *
   * @type {Signal<string>}
   */
  protected readonly char: Signal<string> = computed(() => this.otp.value().charAt(this.index()));

  /**
   * Property active
   * @readonly
   *
   * @description
   * Whether this box is under the focused caret.
   *
   * @type {Signal<boolean>}
   */
  protected readonly active: Signal<boolean> = computed(
    () => this.otp.activeIndex() === this.index(),
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Box classes for the validation and active states.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () =>
      `${SLOT_BASE} ${SLOT_BORDER[this.otp.showInvalid() ? 'invalid' : 'valid']} ${this.active() ? SLOT_ACTIVE : ''}`,
  );
  // #endregion
}
