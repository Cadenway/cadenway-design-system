import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CwCard } from './card.component';
import { PART_PADDING } from './card.styles';

/**
 * The foot of a card, above a top line: the actions of the block (Annuler `outline`, Enregistrer
 * `default`; `justify-end` with the native `class`) or a single link. One main action at most.
 */
@Component({
  selector: 'cw-card-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  templateUrl: './card-footer.component.html',
})
export class CwCardFooter {
  private readonly card = inject(CwCard, { optional: true });

  protected classes(): string {
    return `flex items-center gap-2 border-t pt-3 ${PART_PADDING[this.card?.size() ?? 'default']}`;
  }
}
