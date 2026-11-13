import { booleanAttribute, Component, inject, input, model } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorMagnifyingGlassBold } from '@ng-icons/phosphor-icons/bold';

import { CwSpinner } from '@cadenway/ui/spinner';

import { cwCommandFuzzyFilter } from './command.constants';
import type { CwCommandFilter } from './command.types';
import { type CommandHost, CommandState } from './command-state/command-state.service';

/**
 * A searchable list of actions, places and records, run from the keyboard (Command sheet of the
 * Design System artifact): the inline variant, in a popover or a panel (« Déplacer vers… », the
 * list of a combobox). For the `Ctrl K` palette, use `cw-command-dialog`.
 *
 * Compose it from `input[cwCommandInput]` (shown in the search row, with the spinner while
 * `loading`), `cw-command-list` holding `cw-command-group` / `cw-command-item` /
 * `cw-command-separator`, `cw-command-empty` and `cw-command-loading`, then an optional
 * `cw-command-footer`. `[(search)]` is the typed text (debounce a server search on the caller's
 * side); `filter` scores each item (fuzzy by default, `null` keeps every item for a server-side
 * filter); groups without a match hide. The focus stays in the field: ↑ ↓ (looping with `loop`),
 * Home and End move the highlight, Enter runs the item (its `selected` output), Escape clears the
 * search. `aria-busy` while loading; the result count is announced.
 */
@Component({
  selector: 'cw-command',
  imports: [CwSpinner, NgIcon],
  providers: [CommandState, provideIcons({ phosphorMagnifyingGlassBold })],
  host: {
    class:
      'flex flex-col overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  templateUrl: './command.component.html',
})
export class CwCommand implements CommandHost {
  /** The typed text, `[(search)]`; `searchChange` fires at each keystroke. */
  readonly search = model('');
  /** Scores an item against the search; `null` to filter on the server. */
  readonly filter = input<CwCommandFilter | null>(cwCommandFuzzyFilter);
  /** A server search is running: spinner in the field and in the list, `aria-busy`. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Whether ↑ on the first item goes to the last one, and ↓ on the last to the first. */
  readonly loop = input(true, { transform: booleanAttribute });

  constructor() {
    inject(CommandState).connect(this);
  }
}
