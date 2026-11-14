import { Directive, ElementRef, inject, input, type InputSignal } from '@angular/core';

import type { CwAlertDialog } from '../alert-dialog.component';

/**
 * Directive CwAlertDialogTrigger
 *
 * @description
 * Opens a `cw-alert-dialog` from a button: `<button cwButton [cwAlertDialogTrigger]="remove">`.
 *
 * Sets `aria-haspopup="dialog"` and `aria-expanded` while the dialog is open; focus returns to this
 * element when the dialog closes.
 */
@Directive({
  selector: '[cwAlertDialogTrigger]',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'cwAlertDialogTrigger().open()',
    '(click)': 'cwAlertDialogTrigger().show(element)',
  },
})
export class CwAlertDialogTrigger {
  // #region Properties
  /**
   * Property cwAlertDialogTrigger
   * @readonly
   *
   * @description
   * Alert dialog opened by the trigger.
   *
   * @type {InputSignal<CwAlertDialog>}
   */
  public readonly cwAlertDialogTrigger: InputSignal<CwAlertDialog> =
    input.required<CwAlertDialog>();

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
