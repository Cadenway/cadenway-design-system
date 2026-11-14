import { Component, computed, inject, input, type InputSignal, type Signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorMagnifyingGlassBold } from '@ng-icons/phosphor-icons/bold';

import { CommandState } from '../command-state/command-state.service';

/**
 * Component CwCommandEmpty
 *
 * @description
 * What a command shows when nothing matches and no search is running (Command sheet of the Design System artifact): an icon, `emptyText` (`{search}` becomes the typed text), then the projected fallback action (« Créer la tâche « … » », a `button[cwButton]` `outline` `sm`). Place it in `cw-command-list`.
 */
@Component({
  selector: 'cw-command-empty',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorMagnifyingGlassBold })],
  host: {
    class: 'flex flex-col items-center gap-2 px-4 py-5 text-center text-sm',
    '[attr.hidden]': 'shown() ? null : ""',
  },
  templateUrl: './command-empty.component.html',
})
export class CwCommandEmpty {
  // #region Properties
  /**
   * Property emptyText
   *
   * @description
   * The sentence of the empty state; `{search}` is replaced by the typed text.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly emptyText: InputSignal<string> = input('Aucun résultat pour « {search} »');

  /**
   * Property state
   *
   * @description
   * Shared command state used to render and navigate results.
   *
   * @type {CommandState}
   * @readonly
   */
  private readonly state: CommandState = inject(CommandState);

  /**
   * Property shown
   *
   * @description
   * Whether the empty state should be displayed.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly shown: Signal<boolean> = computed(
    () => !this.state.loading() && this.state.visible().length === 0,
  );

  /**
   * Property text
   *
   * @description
   * Empty-state text with the search substituted.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly text: Signal<string> = computed(() =>
    this.emptyText().replace('{search}', this.state.search().trim()),
  );
  // #endregion
}
