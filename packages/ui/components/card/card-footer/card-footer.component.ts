import { Component, inject } from '@angular/core';

import { CwCard } from '../card.component';
import { PART_PADDING } from '../card.styles';

/**
 * Class CwCardFooter
 * @class CwCardFooter
 *
 * @description
 * The foot of a card, above a top line: the actions of the block (Annuler `outline`, Enregistrer
 * `default`; `justify-end` with the native `class`) or a single link. One main action at most.
 */
@Component({
  selector: 'cw-card-footer',
  host: { '[class]': 'classes()' },
  templateUrl: './card-footer.component.html',
})
export class CwCardFooter {
  // #region Properties
  /**
   * Property card
   * @readonly
   *
   * @description
   * Parent card supplying the padding size, or null outside a card.
   *
   * @type {CwCard | null}
   */
  private readonly card: CwCard | null = inject(CwCard, { optional: true });
  // #endregion

  // #region Methods
  /**
   * Method classes
   * @method classes
   *
   * @description
   * Combines footer layout and border with padding from the parent card size.
   *
   * @returns {string} Classes applied to the footer host.
   */
  protected classes(): string {
    return `flex items-center gap-2 border-t pt-3 ${PART_PADDING[this.card?.size() ?? 'default']}`;
  }
  // #endregion
}
