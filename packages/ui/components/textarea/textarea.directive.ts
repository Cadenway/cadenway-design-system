import {
  Directive,
  HostAttributeToken,
  booleanAttribute,
  computed,
  inject,
  input,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { ɵFOCUS_FIELD } from '@cadenway/ui/core';

/**
 * Constant BASE
 *
 * @description
 * Literal Textarea sheet classes so Tailwind finds them in the package. A disabled textarea inside
 * an already dimmed field is not dimmed twice.
 *
 * @type {string}
 */
const BASE: string =
  'flex w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-[color,box-shadow] placeholder:text-muted-foreground motion-reduce:transition-none ' +
  'disabled:cursor-not-allowed disabled:opacity-50 group-data-[disabled=true]/field:disabled:opacity-100 ' +
  'aria-invalid:border-destructive/60 aria-invalid:ring-destructive/15 [&[readonly]]:bg-muted';

/**
 * Constant HEIGHTS
 *
 * @description
 * Height classes from the Textarea sheet: automatic fields grow from 64 to 240 pixels, while fixed
 * fields take their height from `rows`.
 *
 * @type {Readonly<{ auto: 'field-sizing-content min-h-16 max-h-60'; fixed: '' }>}
 */
const HEIGHTS: Readonly<{ auto: 'field-sizing-content min-h-16 max-h-60'; fixed: '' }> = {
  auto: 'field-sizing-content min-h-16 max-h-60',
  fixed: '',
} as const;

/**
 * Class CwTextarea
 * @class CwTextarea
 *
 * @description
 * The multi-line text field that grows with its content: task description, blocking reason,
 * release note (Textarea sheet of the Design System artifact).
 *
 * Put it on a native `<textarea>`: the native attributes (`rows`, `maxlength`, `placeholder`,
 * `readonly`, `disabled`) stay the element's, and forms use Angular's native value accessor
 * (`formControlName`, `[formControl]`, `ngModel`, Signal Forms `[formField]`). With `autoResize`
 * (default) the height follows the lines between 64 and 240 px through `field-sizing: content`, with
 * no animation; set it to `false` for a fixed height given by `rows`. When a form control is bound,
 * `aria-invalid="true"` is set while the control is invalid and touched; without one, a static
 * `aria-invalid` attribute is kept. Enter inserts a line; Tab leaves the field.
 */
@Directive({
  selector: 'textarea[cwTextarea]',
  host: {
    '[class]': 'classes()',
    '[attr.aria-invalid]': 'ariaInvalid()',
  },
})
export class CwTextarea {
  // #region Properties
  /**
   * Property autoResize
   * @readonly
   *
   * @description
   * Input allowing the field to grow with its content; false uses the height specified by `rows`.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default true
   */
  public readonly autoResize: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property ngControl
   * @readonly
   *
   * @description
   * Native Angular form control on this element, or null when no control is bound.
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
   * Computed field, focus and height classes for the current resize mode.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${BASE} ${ɵFOCUS_FIELD} ${HEIGHTS[this.autoResize() ? 'auto' : 'fixed']}`,
  );
  // #endregion

  // #region Methods
  /**
   * Method ariaInvalid
   * @method ariaInvalid
   *
   * @description
   * Reads the control's touched and invalid state, or preserves the static attribute without a control.
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
