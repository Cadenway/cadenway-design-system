import { Component, input } from '@angular/core';

import { CwKbd } from '@cadenway/ui/components/kbd';

/**
 * The keyboard help under a palette (Command sheet of the Design System artifact): « ↑ ↓
 * naviguer », « Entrée ouvrir », « Échap fermer » in `kbd` keys, unless other content is
 * projected. The inline variant goes without it.
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
  /** Label of the arrow keys. */
  readonly navigateLabel = input('naviguer');
  /** Label of Enter. */
  readonly runLabel = input('ouvrir');
  /** Label of Escape; empty to leave the key out. */
  readonly closeLabel = input('fermer');
}
