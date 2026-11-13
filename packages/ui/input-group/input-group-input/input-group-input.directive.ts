import { Directive, HostAttributeToken, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/* Literal class string (Input Group preview of the Design System artifact). After a start addon the
   field moves closer: 8 px after an icon, 2 px after a text prefix (`https://`). */
const FIELD =
  'h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed [&[type=number]]:tabular-nums ' +
  'group-has-[>[data-align=inline-start]]/input-group:ps-2 group-has-[>[data-align=inline-start]>cw-input-group-text]/input-group:ps-0.5';

/**
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
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly declaredInvalid = inject(new HostAttributeToken('aria-invalid'), {
    optional: true,
  });

  protected ariaInvalid(): string | null {
    const control = this.ngControl;
    if (!control) return this.declaredInvalid;
    // Read on every check: Reactive Forms state is not a signal, Signal Forms state is.
    return control.invalid === true && control.touched === true ? 'true' : null;
  }
}
