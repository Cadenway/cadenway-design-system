import { Component, computed, input, type InputSignal, type Signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorDotsThreeBold } from '@ng-icons/phosphor-icons/bold';

import type { CwPaginationSize } from '../pagination.types';

/**
 * Constant BOX
 *
 * @description
 * Ellipsis box classes matching each pagination button size.
 *
 * @type {Record<CwPaginationSize, string>}
 */
const BOX: Record<CwPaginationSize, string> = {
  default: 'flex size-8 items-center justify-center text-muted-foreground',
  sm: 'flex size-7 items-center justify-center text-muted-foreground',
};

/**
 * Class CwPaginationEllipsis
 * @class CwPaginationEllipsis
 *
 * @description
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
  // #region Properties
  /**
   * Property size
   * @readonly
   *
   * @description
   * Size matching the surrounding pagination.
   *
   * @type {InputSignal<CwPaginationSize>}
   */
  public readonly size: InputSignal<CwPaginationSize> = input<CwPaginationSize>('default');

  /**
   * Property label
   * @readonly
   *
   * @description
   * Hidden text read in place of the dots.
   *
   * @type {InputSignal<string>}
   */
  public readonly label: InputSignal<string> = input('Pages masquées');

  /**
   * Property box
   * @readonly
   *
   * @description
   * Box classes for the selected size.
   *
   * @type {Signal<string>}
   */
  protected readonly box: Signal<string> = computed(() => BOX[this.size()]);
  // #endregion
}
