import { Component, inject, input } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

import { GROUP_TITLE } from '../select.styles';

/**
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
  /** The title of the group, shown above its options. */
  readonly label = input.required<string>();

  protected readonly titleId = inject(_IdGenerator).getId('cw-select-group-');
  protected readonly titleClass = GROUP_TITLE;
}
