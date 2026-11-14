import { Directive, ElementRef, inject, input, type InputSignal } from '@angular/core';

import type { CwDialog } from '../dialog.component';

/**
 * Directive CwDialogTrigger
 *
 * @description
 * Opens a `cw-dialog` from a button: `<button cwButton [cwDialogTrigger]="rename">`.
 *
 * Sets `aria-haspopup="dialog"` and `aria-expanded` while the dialog is open; focus returns to this
 * element when the dialog closes, whatever closed it.
 */
@Directive({
  selector: '[cwDialogTrigger]',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'cwDialogTrigger().open()',
    '(click)': 'cwDialogTrigger().show(element)',
  },
})
export class CwDialogTrigger {
  // #region Properties
  /**
   * Property cwDialogTrigger
   * @readonly
   *
   * @description
   * Dialog opened by the trigger.
   *
   * @type {InputSignal<CwDialog>}
   */
  public readonly cwDialogTrigger: InputSignal<CwDialog> = input.required<CwDialog>();

  /**
   * Property element
   * @readonly
   *
   * @description
   * Trigger element used to restore focus.
   *
   * @type {HTMLElement}
   */
  protected readonly element: HTMLElement =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  // #endregion
}
