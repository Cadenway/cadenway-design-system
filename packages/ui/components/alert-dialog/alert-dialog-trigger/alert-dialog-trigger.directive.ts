import { Directive, ElementRef, inject, input } from '@angular/core';

import type { CwAlertDialog } from '../alert-dialog.component';

/**
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
  /** The alert dialog to open (a template reference to a `cw-alert-dialog`). */
  readonly cwAlertDialogTrigger = input.required<CwAlertDialog>();

  protected readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
}
