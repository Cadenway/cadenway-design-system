import {
  Directive,
  ElementRef,
  computed,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';

import { FieldContext, registerFieldPart } from '../field-context/field-context.service';
import type { CwFieldLabelVariant } from '../field.types';

/* Literal class strings (Field and Label sheets of the Design System artifact). */
/**
 * Constant VARIANTS
 *
 * @description
 * Label classes by visual variant.
 *
 * @type {Record<CwFieldLabelVariant, string>}
 */
const VARIANTS: Record<CwFieldLabelVariant, string> = {
  // In a horizontal field the label shares the 20 px first line of its control.
  default:
    'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[orientation=horizontal]/field:leading-5',
  card: 'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent has-[[data-state=checked]]:border-foreground/40 has-[[data-state=checked]]:bg-selected has-disabled:cursor-not-allowed motion-reduce:transition-none',
};

/**
 * Directive CwFieldLabel
 *
 * @description
 * The visible name of a field's control (the Label look). Inside a `cw-field` without its own `for`,
 * it is pointed at the field's control. With `variant="card"` it wraps its control and texts into a
 * choice card: bordered, `bg-accent` on hover, `bg-selected` with a `foreground/40` border once
 * the control inside is checked; the control stays a real checkbox or radio named by the card.
 */
@Directive({
  selector: 'label[cwFieldLabel]',
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
  },
})
export class CwFieldLabel {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Plain label or choice card appearance.
   *
   * @type {InputSignal<CwFieldLabelVariant>}
   */
  public readonly variant: InputSignal<CwFieldLabelVariant> = input<CwFieldLabelVariant>('default');

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Classes for the current label variant.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => VARIANTS[this.variant()]);
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Registers the label with the parent field.
   */
  public constructor() {
    const context: FieldContext | null = inject(FieldContext, { optional: true });
    const element: HTMLLabelElement =
      inject<ElementRef<HTMLLabelElement>>(ElementRef).nativeElement;
    // Static attributes exist at creation: a `for` here is the consumer's own.
    if (context) {
      registerFieldPart(context.labels, { element, explicit: element.hasAttribute('for') });
    }
  }
  // #endregion
}
