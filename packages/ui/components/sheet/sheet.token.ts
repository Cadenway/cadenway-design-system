import { InjectionToken, type Signal } from '@angular/core';

import type { CwSheetCloseReason } from './sheet.types';

/**
 * Interface CwSheetContext
 *
 * @description
 * What the parts of a sheet read from the `cw-sheet` they are projected into.
 */
export interface CwSheetContext {
  // #region Properties
  /**
   * Property showClose
   * @readonly
   *
   * @description
   * Whether the close button sits at the top right, so the header leaves room for it.
   *
   * @type {Signal<boolean>}
   */
  readonly showClose: Signal<boolean>;

  /**
   * Property titleId
   * @readonly
   *
   * @description
   * Id given to `h2[cwSheetTitle]`, which names the sheet (`aria-labelledby`).
   *
   * @type {string}
   */
  readonly titleId: string;

  /**
   * Property descriptionId
   * @readonly
   *
   * @description
   * Id given to `p[cwSheetDescription]`, which describes the sheet (`aria-describedby`).
   *
   * @type {string}
   */
  readonly descriptionId: string;
  // #endregion

  // #region Methods
  /**
   * Method requestClose
   *
   * @description
   * Closes the sheet for the given reason.
   *
   * @param {CwSheetCloseReason} reason - Why the sheet closes, emitted by `closed`.
   */
  requestClose(reason: CwSheetCloseReason): void;
  // #endregion
}

/**
 * Constant CW_SHEET
 *
 * @description
 * The sheet the header, title, description and close parts belong to.
 *
 * @type {InjectionToken<CwSheetContext>}
 */
export const CW_SHEET: InjectionToken<CwSheetContext> = new InjectionToken<CwSheetContext>(
  'CW_SHEET',
);
