import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorDotsThreeBold } from '@ng-icons/phosphor-icons/bold';

import type { CwPaginationSize } from '../pagination.types';

const BOX: Record<CwPaginationSize, string> = {
  default: 'flex size-8 items-center justify-center text-muted-foreground',
  sm: 'flex size-7 items-center justify-center text-muted-foreground',
};

/**
 * The pages left out between two numbers of a pagination: `dots-three` in a box the size of a
 * button (Pagination sheet of the Design System artifact, anatomy 5).
 *
 * The dots are `aria-hidden`; a screen reader reads the hidden text « Pages masquées » (`label`).
 * `cw-pagination` draws it; it is exported for a routed pagination built by hand.
 */
@Component({
  selector: 'cw-pagination-ellipsis',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorDotsThreeBold })],
  host: { class: 'contents' },
  templateUrl: './pagination-ellipsis.component.html',
})
export class CwPaginationEllipsis {
  /** Size of the pagination it sits in. */
  readonly size = input<CwPaginationSize>('default');
  /** Hidden text read in place of the dots. */
  readonly label = input('Pages masquées');

  protected readonly box = computed(() => BOX[this.size()]);
}
