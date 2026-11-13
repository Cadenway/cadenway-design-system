import { ChangeDetectionStrategy, Component, HostAttributeToken, inject } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

import { FieldContext, registerFieldPart } from './field-context.service';

const PLACES = {
  field: 'block text-xs text-muted-foreground',
  // Under the legend of a set, the description reads as its subtitle, 4 px below it.
  set: 'block text-sm text-muted-foreground [legend+&]:-mt-3',
} as const;

/**
 * Help text: under a control in a `cw-field` (12 px, linked to the control through
 * `aria-describedby`), or under the legend of a set (13 px). Keep it for help that helps; never
 * repeat the label.
 */
@Component({
  selector: 'cw-field-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'id',
    '[class]': 'classes',
  },
  templateUrl: './field-description.component.html',
})
export class CwFieldDescription {
  private readonly context = inject(FieldContext, { optional: true });

  protected readonly id =
    inject(new HostAttributeToken('id'), { optional: true }) ??
    inject(_IdGenerator).getId('cw-field-description-');
  protected readonly classes = PLACES[this.context ? 'field' : 'set'];

  constructor() {
    if (this.context) registerFieldPart(this.context.descriptions, this.id);
  }
}
