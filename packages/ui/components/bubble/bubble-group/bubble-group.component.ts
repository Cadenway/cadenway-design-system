import { Component, computed, contentChildren } from '@angular/core';

import { BUBBLE, BUBBLE_GROUP, type BubbleGroupRef, type BubbleRef } from '../bubble.token';
import type { CwBubblePosition } from '../bubble.types';

/**
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
  private readonly bubbles = contentChildren(BUBBLE, { descendants: true });

  protected readonly side = computed(() => this.bubbles()[0]?.side() ?? 'start');

  /** Place of a bubble of this group; `null` when it stands alone. */
  positionOf(bubble: BubbleRef): CwBubblePosition | null {
    const bubbles = this.bubbles();
    const index = bubbles.indexOf(bubble);
    if (index < 0 || bubbles.length < 2) return null;
    if (index === 0) return 'first';
    return index === bubbles.length - 1 ? 'last' : 'middle';
  }
}
