import { Directive, ElementRef, inject, input } from '@angular/core';

import type { CwDialog } from '../dialog.component';

/**
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
  /** The dialog to open (a template reference to a `cw-dialog`). */
  readonly cwDialogTrigger = input.required<CwDialog>();

  protected readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
}
