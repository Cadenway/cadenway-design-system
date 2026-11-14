import { Component, computed, inject, input, type InputSignal, type Signal } from '@angular/core';

import { CwSpinner } from '@cadenway/ui/components/spinner';

import { CommandState } from '../command-state/command-state.service';

/**
 * Component CwCommandLoading
 *
 * @description
 * The waiting row of a command while it is `loading` (Command sheet of the Design System artifact): the Cadenway spinner and « Recherche… », or the projected text (« Recherche dans 1 284 tâches… »). The rows already known stay shown above it. Place it in `cw-command-list`.
 */
@Component({
  selector: 'cw-command-loading',
  imports: [CwSpinner],
  host: {
    '[class]': 'classes()',
    '[attr.hidden]': 'state.loading() ? null : ""',
  },
  templateUrl: './command-loading.component.html',
})
export class CwCommandLoading {
  // #region Properties
  /**
   * Property label
   *
   * @description
   * The text next to the spinner, when no content is projected.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly label: InputSignal<string> = input('Recherche…');

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
   * Property classes
   *
   * @description
   * Loading-row classes: 80 pixels when alone, 36 pixels below known results.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly classes: Signal<string> = computed(() =>
    this.state.visible().length === 0
      ? 'flex h-20 items-center justify-center gap-2 text-sm text-muted-foreground'
      : 'flex h-9 items-center justify-center gap-2 text-sm text-muted-foreground',
  );
  // #endregion
}
