import { Directive, inject } from '@angular/core';

import { CW_SHEET, type CwSheetContext } from '../sheet.token';

/**
 * Directive CwSheetClose
 *
 * @description
 * Closes the `cw-sheet` it is in on click, with the reason `close` (a « Fermer » or « Annuler »
 * button of the footer).
 */
@Directive({
  selector: 'button[cwSheetClose]',
  host: { '(click)': 'sheet?.requestClose("close")' },
})
export class CwSheetClose {
  // #region Properties
  /**
   * Property sheet
   * @readonly
   *
   * @description
   * Sheet closed by this button, null outside a sheet.
   *
   * @type {CwSheetContext | null}
   */
  protected readonly sheet: CwSheetContext | null = inject(CW_SHEET, { optional: true });
  // #endregion
}
