import { Component, inject, input, type InputSignal } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

import { GROUP_TITLE } from '../select.styles';

/**
 * Component CwSelectGroup
 *
 * @description
 * A titled run of options of a `cw-select` (statuses by category: « Pas commencé », « Actif »,
 * « Fermé »), separated from the next one by a `cw-select-separator` (Select sheet of the Design
 * System artifact).
 *
 * Renders `role="group"` named by its visible `label`.
 */
@Component({
  selector: 'cw-select-group',
  host: {
    class: 'block',
    role: 'group',
    '[attr.aria-labelledby]': 'titleId',
  },
  templateUrl: './select-group.component.html',
})
export class CwSelectGroup {
  // #region Properties
  /**
   * Property label
   * @readonly
   *
   * @description
   * Title shown above the options.
   *
   * @type {InputSignal<string>}
   */
  public readonly label: InputSignal<string> = input.required<string>();

  /**
   * Property titleId
   * @readonly
   *
   * @description
   * Identifier naming the option group.
   *
   * @type {string}
   */
  protected readonly titleId: string = inject(_IdGenerator).getId('cw-select-group-');

  /**
   * Property titleClass
   * @readonly
   *
   * @description
   * Classes for the group title.
   *
   * @type {string}
   */
  protected readonly titleClass: string = GROUP_TITLE;
  // #endregion
}
