import { Component, inject } from '@angular/core';

import { CwCard } from '../card.component';
import { PART_PADDING } from '../card.styles';

/**
 * Class CwCardContent
 * @class CwCardContent
 *
 * @description
 * Presents the card body with the same horizontal padding as its header and footer.
 */
@Component({
  selector: 'cw-card-content',
  host: { '[class]': 'classes()' },
  templateUrl: './card-content.component.html',
})
export class CwCardContent {
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
   * Selects body padding from the parent card size, using standard padding without a parent.
   *
   * @returns {string} Classes applied to the content host.
   */
  protected classes(): string {
    return `block ${PART_PADDING[this.card?.size() ?? 'default']}`;
  }
  // #endregion
}
