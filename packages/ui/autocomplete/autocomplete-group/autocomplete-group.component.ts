import { Component, inject, input } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

import { GROUP_TITLE } from '../autocomplete.styles';

/**
 * A titled run of suggestions of a `cw-autocomplete` (« Tâches », « Listes »), with a line above
 * every group but the first (Autocomplete sheet of the Design System artifact).
 *
 * Renders `role="group"` named by its visible `label`.
 */
@Component({
  selector: 'cw-autocomplete-group',
  host: {
    role: 'group',
    // The preview's separator: a line edge to edge of the panel above every group but the first.
    class: 'block not-first:-mx-1 not-first:mt-1 not-first:border-t not-first:px-1 not-first:pt-1',
    '[attr.aria-labelledby]': 'titleId',
  },
  templateUrl: './autocomplete-group.component.html',
})
export class CwAutocompleteGroup {
  /** The title of the group, shown above its suggestions. */
  readonly label = input.required<string>();

  protected readonly titleId = inject(_IdGenerator).getId('cw-autocomplete-group-');
  protected readonly titleClass = GROUP_TITLE;
}
