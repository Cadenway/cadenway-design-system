import { Directive, HostAttributeToken, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * The multi-line field of a `cw-input-group` (comment composer): borderless, it grows with its
 * content from 56 px (`field-sizing: content`). Same forms contract as `input[cwInputGroupInput]`;
 * the group becomes a column, with `block-start` and `block-end` addons above and below.
 */
@Directive({
  selector: 'textarea[cwInputGroupTextarea]',
  host: {
    class:
      'w-full field-sizing-content min-h-14 resize-none bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed',
    '[attr.aria-invalid]': 'ariaInvalid()',
  },
})
export class CwInputGroupTextarea {
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
