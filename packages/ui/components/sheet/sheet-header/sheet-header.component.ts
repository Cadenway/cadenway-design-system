import { Component, computed, inject, type Signal } from '@angular/core';

import { CW_SHEET, type CwSheetContext } from '../sheet.token';

/**
 * Component CwSheetHeader
 *
 * @description
 * The top of a `cw-sheet`, above a rule, which does not scroll (Sheet sheet, anatomy 3): metadata
 * (a status, a mono identifier), the `h2[cwSheetTitle]` and a `p[cwSheetDescription]`, stacked. It
 * leaves room on the right for the close button.
 */
@Component({
  selector: 'cw-sheet-header',
  host: { '[class]': 'classes()' },
  templateUrl: './sheet-header.component.html',
})
export class CwSheetHeader {
  // #region Properties
  /**
   * Property sheet
   * @readonly
   *
   * @description
   * Sheet the header belongs to, which tells whether the close button is shown.
   *
   * @type {CwSheetContext | null}
   */
  private readonly sheet: CwSheetContext | null = inject(CW_SHEET, { optional: true });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Header classes, with room for the close button when it is shown.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () =>
      `flex shrink-0 flex-col gap-1 border-b py-3 pl-4 ${this.sheet?.showClose() ? 'pr-12' : 'pr-4'}`,
  );
  // #endregion
}
