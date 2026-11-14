import { Component, inject, input, type InputSignal } from '@angular/core';

import { CommandState } from '../command-state/command-state.service';

// The rows enter one by one, 60 ms then 30 ms more each, twelve at most (cw-motion-tokens), at
// opening only: a group shown again by the filter must not replay it (Command sheet, "Mouvement").
/**
 * Constant ENTRANCE
 *
 * @description
 * Staggered entrance classes for command-list rows.
 *
 * @type {string}
 */
const ENTRANCE: string =
  '*:animate-item-in *:motion-reduce:animate-none [&>*:nth-child(1)]:[animation-delay:60ms] [&>*:nth-child(2)]:[animation-delay:90ms] [&>*:nth-child(3)]:[animation-delay:120ms] [&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:180ms] [&>*:nth-child(6)]:[animation-delay:210ms] [&>*:nth-child(7)]:[animation-delay:240ms] [&>*:nth-child(8)]:[animation-delay:270ms] [&>*:nth-child(9)]:[animation-delay:300ms] [&>*:nth-child(10)]:[animation-delay:330ms] [&>*:nth-child(11)]:[animation-delay:360ms] [&>*:nth-child(12)]:[animation-delay:390ms]';

/**
 * Component CwCommandList
 *
 * @description
 * The scrolling results of a command: a `role="listbox"` of `cw-command-group` and `cw-command-item` (Command sheet of the Design System artifact), at most `min(400px, 60vh)` high. `cw-command-loading` and `cw-command-empty` placed in it render under the listbox, outside its options. Name it with `ariaLabel` (« Résultats »).
 */
@Component({
  selector: 'cw-command-list',
  host: {
    class: 'block max-h-[min(400px,60vh)] overflow-y-auto p-1',
  },
  templateUrl: './command-list.component.html',
})
export class CwCommandList {
  // #region Properties
  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name of the listbox.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string> = input('Résultats');

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

  /**
   * Property entranceClass
   *
   * @description
   * Staggered entrance classes for the list.
   *
   * @type {string}
   * @readonly
   */
  protected readonly entranceClass: string = ENTRANCE;
  // #endregion
}
