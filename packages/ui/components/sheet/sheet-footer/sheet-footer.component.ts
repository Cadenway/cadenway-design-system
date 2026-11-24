import { Component } from '@angular/core';

/**
 * Component CwSheetFooter
 *
 * @description
 * The optional bottom of a `cw-sheet`, below a rule, which does not scroll (Sheet sheet, anatomy
 * 5): a comment composer or the sheet's actions, in a row.
 */
@Component({
  selector: 'cw-sheet-footer',
  host: { class: 'flex shrink-0 items-center gap-2 border-t px-4 py-3' },
  templateUrl: './sheet-footer.component.html',
})
export class CwSheetFooter {}
