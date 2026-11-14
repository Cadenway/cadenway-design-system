import { Component, computed, contentChildren, type Signal } from '@angular/core';

import { BUBBLE, BUBBLE_GROUP, type BubbleGroupRef, type BubbleRef } from '../bubble.token';
import type { CwBubbleAlign, CwBubblePosition } from '../bubble.types';

/**
 * Class CwBubbleGroup
 * @class CwBubbleGroup
 *
 * @description
 * Stacks consecutive bubbles of one person 2 px apart and tightens their inner corners (Bubble
 * sheet of the Design System artifact, "Groupée").
 *
 * Each `cw-bubble` inside gets `data-position="first|middle|last"` (a lone bubble keeps its round
 * corners); the stack aligns to the side of its first bubble (`data-align`).
 */
@Component({
  selector: 'cw-bubble-group',
  providers: [{ provide: BUBBLE_GROUP, useExisting: CwBubbleGroup }],
  host: {
    class: 'flex flex-col gap-0.5 data-[align=end]:items-end',
    '[attr.data-align]': 'side()',
  },
  templateUrl: './bubble-group.component.html',
})
export class CwBubbleGroup implements BubbleGroupRef {
  // #region Properties
  /**
   * Property bubbles
   * @readonly
   *
   * @description
   * Descendant bubbles in content order.
   *
   * @type {Signal<readonly BubbleRef[]>}
   */
  private readonly bubbles: Signal<readonly BubbleRef[]> = contentChildren(BUBBLE, {
    descendants: true,
  });

  /**
   * Property side
   * @readonly
   *
   * @description
   * Alignment of the first bubble, or start when the group is empty.
   *
   * @type {Signal<CwBubbleAlign>}
   */
  protected readonly side: Signal<CwBubbleAlign> = computed(
    () => this.bubbles()[0]?.side() ?? 'start',
  );
  // #endregion

  // #region Methods
  /**
   * Method positionOf
   * @method positionOf
   *
   * @description
   * Returns a bubble's position in the stack, or null if it stands alone.
   *
   * @param {BubbleRef} bubble - Bubble to locate.
   * @returns {CwBubblePosition | null} Position within the stack.
   */
  public positionOf(bubble: BubbleRef): CwBubblePosition | null {
    const bubbles: readonly BubbleRef[] = this.bubbles();
    const index: number = bubbles.indexOf(bubble);
    if (index < 0 || bubbles.length < 2) return null;
    if (index === 0) return 'first';
    return index === bubbles.length - 1 ? 'last' : 'middle';
  }
  // #endregion
}
