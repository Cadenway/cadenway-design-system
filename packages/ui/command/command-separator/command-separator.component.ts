import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CommandState } from '../command-state/command-state.service';

/**
 * A hairline between the groups of a command list (Command sheet of the Design System artifact).
 * Decorative (`aria-hidden`: a listbox only owns groups and options) and hidden while a search
 * shrinks the groups to their matches.
 */
@Component({
  selector: 'cw-command-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: '-mx-1 my-1 block h-px bg-border',
    'aria-hidden': 'true',
    '[attr.hidden]': 'state.search().trim() ? "" : null',
  },
  templateUrl: './command-separator.component.html',
})
export class CwCommandSeparator {
  protected readonly state = inject(CommandState);
}
