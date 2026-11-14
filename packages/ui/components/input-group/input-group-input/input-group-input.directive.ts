import { Directive, HostAttributeToken, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/* Literal class string (Input Group preview of the Design System artifact). After a start addon the
   field moves closer: 8 px after an icon, 2 px after a text prefix (`https://`). */
/**
 * Constant FIELD
 *
 * @description
 * Borderless field classes adjusted for a leading addon.
 *
 * @type {string}
 */
const FIELD: string =
  'h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed [&[type=number]]:tabular-nums ' +
  'group-has-[>[data-align=inline-start]]/input-group:ps-2 group-has-[>[data-align=inline-start]>cw-input-group-text]/input-group:ps-0.5';

/**
 * Class CwInputGroupInput
 * @class CwInputGroupInput
 *
 * @description
 * The single-line field of a `cw-input-group`: borderless, no halo of its own (the group draws
 * them). Put it on a native `<input>`; it keeps Angular's native value accessor (`formControlName`,
 * `[formControl]`, `ngModel`, Signal Forms `[formField]`) and gets `aria-invalid="true"` while the
 * bound control is invalid and touched (without a control, a static `aria-invalid` is kept); the
 * group shows it.
 */
@Directive({
  selector: 'input[cwInputGroupInput]',
  host: {
    class: FIELD,
    '[attr.aria-invalid]': 'ariaInvalid()',
  },
})
export class CwInputGroupInput {
  // #region Properties
  /**
   * Property ngControl
   * @readonly
   *
   * @description
   * Optional form control supplying validity and touched state.
   *
   * @type {NgControl | null}
   */
  private readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  /**
   * Property declaredInvalid
   * @readonly
   *
   * @description
   * Static aria-invalid attribute used without a form control.
   *
   * @type {string | null}
   */
  private readonly declaredInvalid: string | null = inject(new HostAttributeToken('aria-invalid'), {
    optional: true,
  });
  // #endregion

  // #region Methods
  /**
   * Method ariaInvalid
   * @method ariaInvalid
   *
   * @description
   * Returns invalid state from the touched form control or the static attribute.
   *
   * @returns {string | null} The invalid attribute value, or null when the field is not invalid.
   */
  protected ariaInvalid(): string | null {
    const control: NgControl | null = this.ngControl;
    if (!control) return this.declaredInvalid;
    // Read on every check: Reactive Forms state is not a signal, Signal Forms state is.
    return control.invalid === true && control.touched === true ? 'true' : null;
  }
  // #endregion
}
