import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { CommandState } from '../command-state/command-state.service';

// The rows enter one by one, 60 ms then 30 ms more each, twelve at most (cw-motion-tokens), at
// opening only: a group shown again by the filter must not replay it (Command sheet, "Mouvement").
const ENTRANCE =
  '*:animate-item-in *:motion-reduce:animate-none [&>*:nth-child(1)]:[animation-delay:60ms] [&>*:nth-child(2)]:[animation-delay:90ms] [&>*:nth-child(3)]:[animation-delay:120ms] [&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:180ms] [&>*:nth-child(6)]:[animation-delay:210ms] [&>*:nth-child(7)]:[animation-delay:240ms] [&>*:nth-child(8)]:[animation-delay:270ms] [&>*:nth-child(9)]:[animation-delay:300ms] [&>*:nth-child(10)]:[animation-delay:330ms] [&>*:nth-child(11)]:[animation-delay:360ms] [&>*:nth-child(12)]:[animation-delay:390ms]';

/**
 * The scrolling results of a command: a `role="listbox"` of `cw-command-group` and
 * `cw-command-item` (Command sheet of the Design System artifact), at most `min(400px, 60vh)`
 * high. `cw-command-loading` and `cw-command-empty` placed in it render under the listbox, outside
 * its options. Name it with `ariaLabel` (« Résultats »).
 */
@Component({
  selector: 'cw-command-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block max-h-[min(400px,60vh)] overflow-y-auto p-1',
  },
  templateUrl: './command-list.component.html',
})
export class CwCommandList {
  /** Accessible name of the listbox. */
  readonly ariaLabel = input('Résultats');

  protected readonly state = inject(CommandState);
  protected readonly entranceClass = ENTRANCE;
}
