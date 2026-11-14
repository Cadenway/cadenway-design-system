import { Component, HostAttributeToken, inject } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

import { FieldContext, registerFieldPart } from '../field-context/field-context.service';

/**
 * Constant PLACES
 *
 * @description
 * Description classes inside a field or field set.
 *
 * @type {typeof PLACES}
 */
const PLACES: {
  readonly field: 'block text-xs text-muted-foreground';
  readonly set: 'block text-sm text-muted-foreground [legend+&]:-mt-3';
} = {
  field: 'block text-xs text-muted-foreground',
  // Under the legend of a set, the description reads as its subtitle, 4 px below it.
  set: 'block text-sm text-muted-foreground [legend+&]:-mt-3',
} as const;

/**
 * Component CwFieldDescription
 *
 * @description
 * Help text: under a control in a `cw-field` (12 px, linked to the control through
 * `aria-describedby`), or under the legend of a set (13 px). Keep it for help that helps; never
 * repeat the label.
 */
@Component({
  selector: 'cw-field-description',
  host: {
    '[attr.id]': 'id',
    '[class]': 'classes',
  },
  templateUrl: './field-description.component.html',
})
export class CwFieldDescription {
  // #region Properties
  /**
   * Property context
   * @readonly
   *
   * @description
   * Parent field context when present.
   *
   * @type {FieldContext | null}
   */
  private readonly context: FieldContext | null = inject(FieldContext, { optional: true });

  /**
   * Property id
   * @readonly
   *
   * @description
   * Identifier registered with the field.
   *
   * @type {string}
   */
  protected readonly id: string =
    inject(new HostAttributeToken('id'), { optional: true }) ??
    inject(_IdGenerator).getId('cw-field-description-');

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Description classes based on its container.
   *
   * @type {string}
   */
  protected readonly classes: string = PLACES[this.context ? 'field' : 'set'];
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Registers the description with the parent field.
   */
  public constructor() {
    if (this.context) registerFieldPart(this.context.descriptions, this.id);
  }
  // #endregion
}
