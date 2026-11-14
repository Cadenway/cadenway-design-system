import { Directive, computed, input, type InputSignal, type Signal } from '@angular/core';

import { ALIGNS } from '../table.styles';
import type { CwTableAlign } from '../table.types';

/**
 * Class CwTableCell
 * @class CwTableCell
 *
 * @description
 * Styles a data cell; end alignment right-aligns numbers and uses tabular figures.
 */
@Directive({
  selector: 'td[cwTableCell]',
  host: { '[class]': 'classes()' },
})
export class CwTableCell {
  // #region Properties
  /**
   * Property align
   * @readonly
   *
   * @description
   * Input selecting alignment of the cell contents.
   *
   * @type {InputSignal<CwTableAlign>}
   * @default 'start'
   */
  public readonly align: InputSignal<CwTableAlign> = input<CwTableAlign>('start');

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Cell padding and vertical alignment combined with the selected horizontal alignment.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `px-3 align-middle ${ALIGNS[this.align()]}`,
  );
  // #endregion
}
