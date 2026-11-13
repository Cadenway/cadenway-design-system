import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
} from '@angular/core';
import { ɵFOCUS_FIELD_WITHIN } from '@cadenway/ui/core';

import type { CwInputGroupSize } from './input-group.types';

/* Literal class strings (Input Group sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. The group carries the border and the focus halo; the field
   inside has neither. A text area turns the group into a column. */
const BASE =
  'group/input-group relative flex w-full min-w-0 items-center border border-input transition-[color,box-shadow] motion-reduce:transition-none ' +
  'has-[>textarea]:h-auto has-[>textarea]:flex-col has-[>textarea]:items-stretch ' +
  'has-[[aria-invalid=true]]:border-destructive/60 has-[[aria-invalid=true]]:ring-destructive/15 ' +
  'has-[>input:disabled]:opacity-50 has-[>textarea:disabled]:opacity-50';

const SIZES: Record<CwInputGroupSize, string> = {
  sm: 'h-7 rounded-md',
  default: 'h-8 rounded-lg',
  lg: 'h-9 rounded-lg',
};

/**
 * A field and its complements inside one border: a search icon, a URL prefix, a counter, a button,
 * the action bar of a comment (Input Group sheet of the Design System artifact).
 *
 * `role="group"`; the field inside (`input[cwInputGroupInput]` or `textarea[cwInputGroupTextarea]`)
 * keeps its own label (`aria-label` or a label) and its native value accessor. The group draws the
 * border, the focus halo of the field inside (`focus-within`), the error border while the field
 * has `aria-invalid="true"`, and dims to 50 % with `aria-disabled="true"` while it is disabled.
 * With a text area, the group becomes a column and its height follows the content. Write the parts
 * in visual order: Tab follows it.
 */
@Component({
  selector: 'cw-input-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    '[class]': 'classes()',
    '[attr.data-size]': 'size()',
    '[attr.aria-disabled]': 'fieldDisabled() ? "true" : null',
  },
  templateUrl: './input-group.component.html',
})
export class CwInputGroup {
  /** Height and radius: 28, 32 or 36 px. */
  readonly size = input<CwInputGroupSize>('default');

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly classes = computed(
    () => `${BASE} ${ɵFOCUS_FIELD_WITHIN} ${SIZES[this.size()]}`,
  );

  protected fieldDisabled(): boolean {
    // Read on every check: a form disables the field through a DOM property, not a signal.
    return (
      this.element.querySelector(':scope > input:disabled, :scope > textarea:disabled') !== null
    );
  }
}
