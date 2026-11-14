import { Component, input, type InputSignal } from '@angular/core';

import { CwKbd } from '@cadenway/ui/components/kbd';

/**
 * Component CwCommandFooter
 *
 * @description
 * The keyboard help under a palette (Command sheet of the Design System artifact): « ↑ ↓ naviguer », « Entrée ouvrir », « Échap fermer » in `kbd` keys, unless other content is projected. The inline variant goes without it.
 */
@Component({
  selector: 'cw-command-footer',
  imports: [CwKbd],
  host: {
    class: 'flex h-9 items-center gap-4 border-t px-3 text-xs text-muted-foreground',
  },
  templateUrl: './command-footer.component.html',
})
export class CwCommandFooter {
  // #region Properties
  /**
   * Property navigateLabel
   *
   * @description
   * Label of the arrow keys.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly navigateLabel: InputSignal<string> = input('naviguer');

  /**
   * Property runLabel
   *
   * @description
   * Label of Enter.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly runLabel: InputSignal<string> = input('ouvrir');

  /**
   * Property closeLabel
   *
   * @description
   * Label of Escape; empty to leave the key out.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly closeLabel: InputSignal<string> = input('fermer');
  // #endregion
}
