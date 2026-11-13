import { Component, computed, inject, input } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

import { PROPERTY_LIST } from '../property-list.token';

/**
 * A titled group of properties in a vertical `cw-property-list`: « Propriétés », « Champs
 * personnalisés » (Property List sheet of the Design System artifact).
 *
 * Renders a `role="group"` named by its `label`, shown as a muted 28 px title; from the second group
 * on, a hairline separates it from the previous one. Holds `cw-property` rows, aligned on the
 * list's label column. Only valid inside `cw-property-list`.
 */
@Component({
  selector: 'cw-property-group',
  host: {
    class: 'block',
    role: 'group',
    '[attr.aria-labelledby]': 'titleId',
  },
  templateUrl: './property-group.component.html',
})
export class CwPropertyGroup {
  /** Title of the group (« Propriétés »). */
  readonly label = input.required<string>();

  protected readonly list = inject(PROPERTY_LIST);
  protected readonly titleId = inject(_IdGenerator).getId('cw-property-group-');
  protected readonly first = computed(() => this.list.isFirstGroup(this));
}
