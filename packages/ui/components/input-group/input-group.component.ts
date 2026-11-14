import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { ɵFOCUS_FIELD_WITHIN } from '@cadenway/ui/core';

import type { CwInputGroupSize } from './input-group.types';

/**
 * Constant BASE
 *
 * @description
 * Literal group layout, border and state classes for input and textarea fields.
 *
 * @type {string}
 */
const BASE: string =
  'group/input-group relative flex w-full min-w-0 items-center border border-input transition-[color,box-shadow] motion-reduce:transition-none ' +
  'has-[>textarea]:h-auto has-[>textarea]:flex-col has-[>textarea]:items-stretch ' +
  'has-[[aria-invalid=true]]:border-destructive/60 has-[[aria-invalid=true]]:ring-destructive/15 ' +
  'has-[>input:disabled]:opacity-50 has-[>textarea:disabled]:opacity-50';

/**
 * Constant SIZES
 *
 * @description
 * Group height and radius classes for each size.
 *
 * @type {Record<CwInputGroupSize, string>}
 */
const SIZES: Record<CwInputGroupSize, string> = {
  sm: 'h-7 rounded-md',
  default: 'h-8 rounded-lg',
  lg: 'h-9 rounded-lg',
};

/**
 * Class CwInputGroup
 * @class CwInputGroup
 *
 * @description
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
  host: {
    role: 'group',
    '[class]': 'classes()',
    '[attr.data-size]': 'size()',
    '[attr.aria-disabled]': 'fieldDisabled() ? "true" : null',
  },
  templateUrl: './input-group.component.html',
})
export class CwInputGroup {
  // #region Properties
  /**
   * Property size
   * @readonly
   *
   * @description
   * Height and radius for 28, 32 or 36 pixel controls.
   *
   * @type {InputSignal<CwInputGroupSize>}
   */
  public readonly size: InputSignal<CwInputGroupSize> = input<CwInputGroupSize>('default');

  /**
   * Property element
   * @readonly
   *
   * @description
   * Host element containing the native field.
   *
   * @type {HTMLElement}
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Layout, focus and size classes for the group.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${BASE} ${ɵFOCUS_FIELD_WITHIN} ${SIZES[this.size()]}`,
  );
  // #endregion

  // #region Methods
  /**
   * Method fieldDisabled
   * @method fieldDisabled
   *
   * @description
   * Checks the native disabled state of the direct input or textarea.
   *
   * @returns {boolean} Whether the direct field is disabled.
   */
  protected fieldDisabled(): boolean {
    // Read on every check: a form disables the field through a DOM property, not a signal.
    return (
      this.element.querySelector(':scope > input:disabled, :scope > textarea:disabled') !== null
    );
  }
  // #endregion
}
