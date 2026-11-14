import {
  Directive,
  HostAttributeToken,
  computed,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';

import { ALIGNS } from '../table.styles';
import type { CwTableAlign } from '../table.types';

/**
 * Class CwTableHead
 * @class CwTableHead
 *
 * @description
 * A column header: muted, `text-xs`, on one line, `scope="col"` unless another scope is given.
 * `align="end"` for numeric columns.
 */
@Directive({
  selector: 'th[cwTableHead]',
  host: {
    '[class]': 'classes()',
    '[attr.scope]': 'scope ?? "col"',
  },
})
export class CwTableHead {
  // #region Properties
  /**
   * Property align
   * @readonly
   *
   * @description
   * Input selecting header text alignment, normally matching its column's cells.
   *
   * @type {InputSignal<CwTableAlign>}
   * @default 'start'
   */
  public readonly align: InputSignal<CwTableAlign> = input<CwTableAlign>('start');

  /**
   * Property scope
   * @readonly
   *
   * @description
   * Consumer-supplied native scope attribute, or null when the default column scope is used.
   *
   * @type {string | null}
   */
  protected readonly scope: string | null = inject(new HostAttributeToken('scope'), {
    optional: true,
  });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Header typography and spacing combined with the selected alignment.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () =>
      `px-3 align-middle text-xs font-medium whitespace-nowrap text-muted-foreground ${ALIGNS[this.align()]}`,
  );
  // #endregion
}
