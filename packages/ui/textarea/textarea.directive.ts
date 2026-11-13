import {
  Directive,
  HostAttributeToken,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { ɵFOCUS_FIELD } from '@cadenway/ui/core';

/* Literal class strings (Textarea sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. Inside a disabled `cw-field` the whole field is already at 50 %: the
   field does not dim twice. */
const BASE =
  'flex w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-[color,box-shadow] placeholder:text-muted-foreground motion-reduce:transition-none ' +
  'disabled:cursor-not-allowed disabled:opacity-50 group-data-[disabled=true]/field:disabled:opacity-100 ' +
  'aria-invalid:border-destructive/60 aria-invalid:ring-destructive/15 [&[readonly]]:bg-muted';

/* Textarea sheet: the height follows the content from 64 px to 240 px, then the field scrolls; a
   fixed field takes its height from `rows`. */
const HEIGHTS = {
  auto: 'field-sizing-content min-h-16 max-h-60',
  fixed: '',
} as const;

/**
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
  /** Grows with the content (`field-sizing: content`); `false` keeps the height of `rows`. */
  readonly autoResize = input(true, { transform: booleanAttribute });

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly declaredInvalid = inject(new HostAttributeToken('aria-invalid'), {
    optional: true,
  });

  protected readonly classes = computed(
    () => `${BASE} ${ɵFOCUS_FIELD} ${HEIGHTS[this.autoResize() ? 'auto' : 'fixed']}`,
  );

  protected ariaInvalid(): string | null {
    const control = this.ngControl;
    if (!control) return this.declaredInvalid;
    // Read on every check: Reactive Forms state is not a signal, Signal Forms state is.
    return control.invalid === true && control.touched === true ? 'true' : null;
  }
}
