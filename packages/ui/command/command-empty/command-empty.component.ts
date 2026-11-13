import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorMagnifyingGlassBold } from '@ng-icons/phosphor-icons/bold';

import { CommandState } from '../command-state/command-state.service';

/**
 * What a command shows when nothing matches and no search is running (Command sheet of the
 * Design System artifact): an icon, `emptyText` (`{search}` becomes the typed text), then the
 * projected fallback action (« Créer la tâche « … » », a `button[cwButton]` `outline` `sm`).
 * Place it in `cw-command-list`.
 */
@Component({
  selector: 'cw-command-empty',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorMagnifyingGlassBold })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col items-center gap-2 px-4 py-5 text-center text-sm',
    '[attr.hidden]': 'shown() ? null : ""',
  },
  templateUrl: './command-empty.component.html',
})
export class CwCommandEmpty {
  /** The sentence of the empty state; `{search}` is replaced by the typed text. */
  readonly emptyText = input('Aucun résultat pour « {search} »');

  private readonly state = inject(CommandState);

  protected readonly shown = computed(
    () => !this.state.loading() && this.state.visible().length === 0,
  );
  protected readonly text = computed(() =>
    this.emptyText().replace('{search}', this.state.search().trim()),
  );
}
