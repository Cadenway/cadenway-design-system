import { _IdGenerator } from '@angular/cdk/a11y';
import { Directive, inject } from '@angular/core';

import { CW_SHEET } from '../sheet.token';

/**
 * Directive CwSheetTitle
 *
 * @description
 * The title of a `cw-sheet` (the task name), which names it through `aria-labelledby`.
 */
@Directive({
  selector: 'h2[cwSheetTitle]',
  host: { class: 'text-base font-semibold', '[id]': 'id' },
})
export class CwSheetTitle {
  // #region Properties
  /**
   * Property id
   * @readonly
   *
   * @description
   * Id the sheet points to, or a generated one outside a sheet.
   *
   * @type {string}
   */
  protected readonly id: string =
    inject(CW_SHEET, { optional: true })?.titleId ?? inject(_IdGenerator).getId('cw-sheet-title-');
  // #endregion
}
