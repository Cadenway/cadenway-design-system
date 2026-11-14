import { Component, inject } from '@angular/core';

import { CwCard } from '../card.component';
import { PART_PADDING } from '../card.styles';

/**
 * Class CwCardHeader
 * @class CwCardHeader
 *
 * @description
 * The head of a card: title and description on the left, an optional `cw-card-action` on the
 * right spanning both lines (Card sheet of the Design System artifact).
 */
@Component({
  selector: 'cw-card-header',
  host: { '[class]': 'classes()' },
  templateUrl: './card-header.component.html',
})
export class CwCardHeader {
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
   * Combines header grid layout with padding from the parent card size.
   *
   * @returns {string} Classes applied to the header host.
   */
  protected classes(): string {
    return `grid grid-cols-[1fr_auto] items-start gap-x-3 gap-y-1 ${PART_PADDING[this.card?.size() ?? 'default']}`;
  }
  // #endregion
}
