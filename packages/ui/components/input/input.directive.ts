import { Directive, HostAttributeToken, computed, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { ɵFOCUS_FIELD } from '@cadenway/ui/core';

import type { CwInputSize } from './input.types';

/* Literal class strings (Input sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. Inside a disabled `cw-field` the whole field is already at 50 %: the
   field does not dim twice. */
const BASE =
  'w-full min-w-0 border border-input bg-transparent py-1 text-sm transition-[color,box-shadow] placeholder:text-muted-foreground motion-reduce:transition-none ' +
  'disabled:cursor-not-allowed disabled:opacity-50 group-data-[disabled=true]/field:disabled:opacity-100 ' +
  'aria-invalid:border-destructive/60 aria-invalid:ring-destructive/15 [&[readonly]]:bg-muted [&[type=number]]:tabular-nums';

const SIZES: Record<CwInputSize, string> = {
  sm: 'h-7 rounded-md px-2',
  default: 'h-8 rounded-lg px-2.5',
  lg: 'h-9 rounded-lg px-3',
};

/**
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
  /** Height, padding and radius; `sm` next to `sm` buttons in a toolbar. */
  readonly size = input<CwInputSize>('default');

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly declaredInvalid = inject(new HostAttributeToken('aria-invalid'), {
    optional: true,
  });

  protected readonly classes = computed(() => `${BASE} ${ɵFOCUS_FIELD} ${SIZES[this.size()]}`);

  protected ariaInvalid(): string | null {
    const control = this.ngControl;
    if (!control) return this.declaredInvalid;
    // Read on every check: Reactive Forms state is not a signal, Signal Forms state is.
    return control.invalid === true && control.touched === true ? 'true' : null;
  }
}
