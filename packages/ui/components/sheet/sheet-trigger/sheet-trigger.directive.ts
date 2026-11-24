import { Directive, ElementRef, inject, input, type InputSignal } from '@angular/core';

import type { CwSheet } from '../sheet.component';

/**
 * Directive CwSheetTrigger
 *
 * @description
 * Opens the given `cw-sheet` on click (`[cwSheetTrigger]="sheet"`): `aria-haspopup="dialog"`,
 * `aria-expanded` while it is open, and the focus back on this element when it closes.
 */
@Directive({
  selector: '[cwSheetTrigger]',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'cwSheetTrigger().open()',
    '(click)': 'cwSheetTrigger().show(element)',
  },
})
export class CwSheetTrigger {
  // #region Properties
  /**
   * Property cwSheetTrigger
   * @readonly
   *
   * @description
   * Sheet opened by this element.
   *
   * @type {InputSignal<CwSheet>}
   */
  public readonly cwSheetTrigger: InputSignal<CwSheet> = input.required<CwSheet>();

  /**
   * Property element
   * @readonly
   *
   * @description
   * Trigger element, which receives the focus back at closing.
   *
   * @type {HTMLElement}
   */
  protected readonly element: HTMLElement =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  // #endregion
}
