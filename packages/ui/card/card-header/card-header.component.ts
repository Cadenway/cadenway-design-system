import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CwCard } from '../card/card.component';
import { PART_PADDING } from '../card.styles';

/**
 * The head of a card: title and description on the left, an optional `cw-card-action` on the
 * right spanning both lines (Card sheet of the Design System artifact).
 */
@Component({
  selector: 'cw-card-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  templateUrl: './card-header.component.html',
})
export class CwCardHeader {
  private readonly card = inject(CwCard, { optional: true });

  protected classes(): string {
    return `grid grid-cols-[1fr_auto] items-start gap-x-3 gap-y-1 ${PART_PADDING[this.card?.size() ?? 'default']}`;
  }
}
