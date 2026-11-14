import { Component, inject, input, type InputSignal } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

import { GROUP_TITLE } from '../autocomplete.styles';

/**
 * Component CwAutocompleteGroup
 *
 * @description
 * A titled run of suggestions of a `cw-autocomplete` (« Tâches », « Listes »), with a line above
 * every group but the first (Autocomplete sheet of the Design System artifact).
 *
 * Renders `role="group"` named by its visible `label`.
 */
@Component({
  selector: 'cw-autocomplete-group',
  host: {
    role: 'group',
    class: 'block not-first:-mx-1 not-first:mt-1 not-first:border-t not-first:px-1 not-first:pt-1',
    '[attr.aria-labelledby]': 'titleId',
  },
  templateUrl: './autocomplete-group.component.html',
})
export class CwAutocompleteGroup {
  // #region Properties
  /**
   * Property label
   * @readonly
   *
   * @description
   * Title shown above the suggestions.
   *
   * @type {InputSignal<string>}
   */
  public readonly label: InputSignal<string> = input.required<string>();

  /**
   * Property titleId
   * @readonly
   *
   * @description
   * Identifier naming the group.
   *
   * @type {string}
   */
  protected readonly titleId: string = inject(_IdGenerator).getId('cw-autocomplete-group-');

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
