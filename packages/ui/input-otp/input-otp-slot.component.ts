import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

import { CwInputOtp } from './input-otp.component';

/* Literal class strings (Input OTP preview of the Design System artifact). */
const SLOT_BASE =
  'relative flex size-8 items-center justify-center border-y border-r text-sm font-medium tabular-nums transition-[color,box-shadow] motion-reduce:transition-none first:rounded-l-lg first:border-l last:rounded-r-lg';

const SLOT_BORDER = { valid: 'border-input', invalid: 'border-destructive/60' } as const;

const SLOT_ACTIVE = 'z-10 ring-2 ring-ring ring-offset-2 ring-offset-background';

/**
 * One box of `cw-input-otp`: shows the character at its `index`, the focus ring when it is the
 * active box, and a blinking caret when that box is empty (still under reduced motion).
 *
 * Decorative (`aria-hidden`): the native input of the field carries the value. Style hooks:
 * `data-active`, `data-filled`.
 */
@Component({
  selector: 'cw-input-otp-slot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[class]': 'classes()',
    '[attr.data-active]': 'active() ? "" : null',
    '[attr.data-filled]': 'char() ? "" : null',
  },
  templateUrl: './input-otp-slot.component.html',
})
export class CwInputOtpSlot {
  /** Position of the box in the code, from 0. */
  readonly index = input.required({ transform: numberAttribute });

  private readonly otp = inject(CwInputOtp);

  protected readonly char = computed(() => this.otp.value().charAt(this.index()));
  protected readonly active = computed(() => this.otp.activeIndex() === this.index());
  protected readonly classes = computed(
    () =>
      `${SLOT_BASE} ${SLOT_BORDER[this.otp.showInvalid() ? 'invalid' : 'valid']} ${this.active() ? SLOT_ACTIVE : ''}`,
  );
}
