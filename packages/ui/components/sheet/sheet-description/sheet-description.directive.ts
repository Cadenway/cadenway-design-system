import { _IdGenerator } from '@angular/cdk/a11y';
import { Directive, inject } from '@angular/core';

import { CW_SHEET } from '../sheet.token';

/**
 * Directive CwSheetDescription
 *
 * @description
 * The description of a `cw-sheet`, muted below its title; its presence adds `aria-describedby`.
 */
@Directive({
  selector: 'p[cwSheetDescription]',
  host: { class: 'text-sm text-muted-foreground', '[id]': 'id' },
})
export class CwSheetDescription {
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
    inject(CW_SHEET, { optional: true })?.descriptionId ??
    inject(_IdGenerator).getId('cw-sheet-description-');
  // #endregion
}
