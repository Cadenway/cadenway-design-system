import { Component, inject } from '@angular/core';

import { CommandState } from '../command-state/command-state.service';

/**
 * Component CwCommandSeparator
 *
 * @description
 * A hairline between the groups of a command list (Command sheet of the Design System artifact). Decorative (`aria-hidden`: a listbox only owns groups and options) and hidden while a search shrinks the groups to their matches.
 */
@Component({
  selector: 'cw-command-separator',
  host: {
    class: '-mx-1 my-1 block h-px bg-border',
    'aria-hidden': 'true',
    '[attr.hidden]': 'state.search().trim() ? "" : null',
  },
  templateUrl: './command-separator.component.html',
})
export class CwCommandSeparator {
  // #region Properties
  /**
   * Property state
   *
   * @description
   * Shared command state used to render and navigate results.
   *
   * @type {CommandState}
   * @readonly
   */
  protected readonly state: CommandState = inject(CommandState);
  // #endregion
}
