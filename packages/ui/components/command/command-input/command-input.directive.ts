import { Directive, inject } from '@angular/core';

import { CommandState } from '../command-state/command-state.service';

/**
 * Directive CwCommandInput
 *
 * @description
 * The search field of a command: borderless, in the search row of `cw-command` or `cw-command-dialog` (Command sheet of the Design System artifact). Put it on a native `<input>` with a placeholder that says what to type (« Rechercher une tâche, un espace ou une action… ») and an `aria-label` when no label names it. It is the `role="combobox"` of the list: `aria-controls` points at the listbox, `aria-activedescendant` at the highlighted item. Its value is the command's `search`.
 */
@Directive({
  selector: 'input[cwCommandInput]',
  host: {
    class:
      'h-11 w-full min-w-0 bg-transparent text-sm outline-hidden placeholder:text-muted-foreground',
    role: 'combobox',
    'aria-expanded': 'true',
    'aria-autocomplete': 'list',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    '[attr.aria-controls]': 'state.listId',
    '[attr.aria-activedescendant]': 'state.activeDescendant()',
    '[value]': 'state.search()',
    '(input)': 'onInput($event)',
    '(keydown)': 'state.onKeydown($event)',
  },
})
export class CwCommandInput {
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

  // #region Methods
  /**
   * Method onInput
   *
   * @description
   * Updates the command search from the native input.
   *
   * @param {Event} event - Input event from the search field.
   */
  protected onInput(event: Event): void {
    this.state.setSearch((event.target as HTMLInputElement).value);
  }
  // #endregion
}
