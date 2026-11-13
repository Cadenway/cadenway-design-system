import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { CwSpinner } from '@cadenway/ui/spinner';

import { CommandState } from '../command-state/command-state.service';

/**
 * The waiting row of a command while it is `loading` (Command sheet of the Design System
 * artifact): the Cadenway spinner and « Recherche… », or the projected text (« Recherche dans
 * 1 284 tâches… »). The rows already known stay shown above it. Place it in `cw-command-list`.
 */
@Component({
  selector: 'cw-command-loading',
  imports: [CwSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.hidden]': 'state.loading() ? null : ""',
  },
  templateUrl: './command-loading.component.html',
})
export class CwCommandLoading {
  /** The text next to the spinner, when no content is projected. */
  readonly label = input('Recherche…');

  protected readonly state = inject(CommandState);

  // Alone, the row takes the height of the preview (80 px); under known rows, one row (36 px).
  protected readonly classes = computed(() =>
    this.state.visible().length === 0
      ? 'flex h-20 items-center justify-center gap-2 text-sm text-muted-foreground'
      : 'flex h-9 items-center justify-center gap-2 text-sm text-muted-foreground',
  );
}
