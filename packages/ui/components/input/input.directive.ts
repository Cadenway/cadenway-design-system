import {
  Directive,
  HostAttributeToken,
  computed,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { ɵFOCUS_FIELD } from '@cadenway/ui/core';

import type { CwInputSize } from './input.types';

/**
 * Constant BASE
 *
 * @description
 * Literal Input sheet classes so Tailwind finds them in the package. An input in an already dimmed
 * disabled field is not dimmed twice.
 *
 * @type {string}
 */
const BASE: string =
  'w-full min-w-0 border border-input bg-transparent py-1 text-sm transition-[color,box-shadow] placeholder:text-muted-foreground motion-reduce:transition-none ' +
  'disabled:cursor-not-allowed disabled:opacity-50 group-data-[disabled=true]/field:disabled:opacity-100 ' +
  'aria-invalid:border-destructive/60 aria-invalid:ring-destructive/15 [&[readonly]]:bg-muted [&[type=number]]:tabular-nums';

/**
 * Constant SIZES
 *
 * @description
 * Height, radius and padding classes for each supported input size.
 *
 * @type {Record<CwInputSize, string>}
 */
const SIZES: Record<CwInputSize, string> = {
  sm: 'h-7 rounded-md px-2',
  default: 'h-8 rounded-lg px-2.5',
  lg: 'h-9 rounded-lg px-3',
};

/**
 * Class CwInput
 * @class CwInput
 *
 * @description
 * The single-line text field: task name, prefix, URL, e-mail address, password (Input sheet of the
 * Design System artifact). Soft `input` border, focus halo; the label, not the border, signals the
 * field.
 *
 * Put it on a native `<input>`: the native attributes (`type`, `placeholder`, `readonly`,
 * `disabled`, `autocomplete`, `maxlength`) stay the element's, and forms use Angular's native value
 * accessor (`formControlName`, `[formControl]`, `ngModel`, Signal Forms `[formField]`). When a form
 * control is bound, `aria-invalid="true"` is set while the control is invalid and touched; without
 * one, a static `aria-invalid` attribute is kept. Always name it with a visible label (`cw-field`
 * wires `id`, `for` and `aria-describedby`). Listen to the native events.
 */
@Directive({
  selector: 'input[cwInput]',
  host: {
    '[class]': 'classes()',
    '[attr.data-size]': 'size()',
    '[attr.aria-invalid]': 'ariaInvalid()',
  },
})
export class CwInput {
  // #region Properties
  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting height, padding and radius; `sm` aligns with small toolbar buttons.
   *
   * @type {InputSignal<CwInputSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwInputSize> = input<CwInputSize>('default');

  /**
   * Property ngControl
   * @readonly
   *
   * @description
   * Angular form control on this input, or null when no control is bound.
   *
   * @type {NgControl | null}
   */
  private readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  /**
   * Property declaredInvalid
   * @readonly
   *
   * @description
   * Static `aria-invalid` value supplied on the host, or null when absent.
   *
   * @type {string | null}
   */
  private readonly declaredInvalid: string | null = inject(new HostAttributeToken('aria-invalid'), {
    optional: true,
  });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Computed field, focus and size classes applied to the input host.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${BASE} ${ɵFOCUS_FIELD} ${SIZES[this.size()]}`,
  );
  // #endregion

  // #region Methods
  /**
   * Method ariaInvalid
   * @method ariaInvalid
   *
   * @description
   * Reads the bound control's touched and invalid state, or preserves the static attribute otherwise.
   *
   * @returns {string | null} `true` for a touched invalid control, the static value, or null.
   */
  protected ariaInvalid(): string | null {
    const control: NgControl | null = this.ngControl;
    if (!control) return this.declaredInvalid;
    // Read on every check: Reactive Forms state is not a signal, Signal Forms state is.
    return control.invalid === true && control.touched === true ? 'true' : null;
  }
  // #endregion
}
