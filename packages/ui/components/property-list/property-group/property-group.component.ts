import { Component, computed, inject, input, type InputSignal, type Signal } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

import { PROPERTY_LIST, type PropertyListHost } from '../property-list.token';

/**
 * Component CwPropertyGroup
 *
 * @description
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
  // #region Properties
  /**
   * Property label
   * @readonly
   *
   * @description
   * Title of the property group.
   *
   * @type {InputSignal<string>}
   */
  public readonly label: InputSignal<string> = input.required<string>();

  /**
   * Property list
   * @readonly
   *
   * @description
   * Parent property list context.
   *
   * @type {PropertyListHost}
   */
  protected readonly list: PropertyListHost = inject(PROPERTY_LIST);

  /**
   * Property titleId
   * @readonly
   *
   * @description
   * Identifier of the accessible group title.
   *
   * @type {string}
   */
  protected readonly titleId: string = inject(_IdGenerator).getId('cw-property-group-');

  /**
   * Property first
   * @readonly
   *
   * @description
   * Whether this group is first in the list.
   *
   * @type {Signal<boolean>}
   */
  protected readonly first: Signal<boolean> = computed(() => this.list.isFirstGroup(this));
  // #endregion
}
