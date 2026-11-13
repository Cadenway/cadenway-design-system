import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { COMMAND_GROUP } from '../command-group.token';
import { CommandState } from '../command-state/command-state.service';

/**
 * A titled set of items in a command list (« Suggestions », « Tâches récentes », « Espaces »),
 * Command sheet of the Design System artifact. `role="group"` named by its `heading`; it hides
 * itself while none of its items matches the search. Keep it under seven items, with a « Voir
 * tout » item beyond.
 */
@Component({
  selector: 'cw-command-group',
  providers: [{ provide: COMMAND_GROUP, useExisting: CwCommandGroup }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
    role: 'group',
    '[attr.aria-label]': 'heading() || null',
    '[attr.hidden]': 'state.hasVisibleIn(this) ? null : ""',
  },
  templateUrl: './command-group.component.html',
})
export class CwCommandGroup {
  /** Title of the group, shown above its items. */
  readonly heading = input('');

  protected readonly state = inject(CommandState);
}
