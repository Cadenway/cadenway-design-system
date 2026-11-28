import { Component, inject } from '@angular/core';

import { CwCard } from '../card.component';
import { PART_PADDING } from '../card.styles';
import type { CwCardSize } from '../card.types';

/**
 * Constant FOOTER_PADDING
 *
 * @description
 * Vertical padding by card size: in a standard card the footer frames itself with 12 px above
 * and below, the card dropping its bottom padding (mockup `Compte.dc.html`: footer `py-3`); a
 * small card keeps its own `p-3` around the footer.
 *
 * @type {Record<CwCardSize, string>}
 */
const FOOTER_PADDING: Record<CwCardSize, string> = { default: 'py-3', sm: 'pt-3' };

/**
 * Class CwCardFooter
 * @class CwCardFooter
 *
 * @description
 * The foot of a card, above a top line: the actions of the block (Annuler `outline`, Enregistrer
 * `default`; `justify-end` with the native `class`) or a single link. One main action at most.
 * Place it last in its card: a standard card then leaves its bottom spacing to the footer.
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
   * Combines footer layout and border with vertical and horizontal padding from the parent card
   * size.
   *
   * @returns {string} Classes applied to the footer host.
   */
  protected classes(): string {
    const size: CwCardSize = this.card?.size() ?? 'default';
    return `flex items-center gap-2 border-t ${FOOTER_PADDING[size]} ${PART_PADDING[size]}`;
  }
  // #endregion
}
