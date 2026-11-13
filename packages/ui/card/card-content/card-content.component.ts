import { Component, inject } from '@angular/core';

import { CwCard } from '../card.component';
import { PART_PADDING } from '../card.styles';

/** The body of a card, padded like the header and the footer. */
@Component({
  selector: 'cw-card-content',
  host: { '[class]': 'classes()' },
  templateUrl: './card-content.component.html',
})
export class CwCardContent {
  private readonly card = inject(CwCard, { optional: true });

  protected classes(): string {
    return `block ${PART_PADDING[this.card?.size() ?? 'default']}`;
  }
}
