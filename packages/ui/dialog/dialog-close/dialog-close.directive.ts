import { Directive, ElementRef, inject } from '@angular/core';

import { CW_DIALOG } from '../dialog.token';

/**
 * Closes the `cw-dialog` around it with the reason `close`: « Annuler » or « Fermer » in the
 * footer.
 *
 * While the dialog is `pending` the button is `aria-disabled` (dimmed by `cwButton`, still
 * focusable) and its clicks are ignored, before the consumer's own `(click)`.
 */
@Directive({
  selector: 'button[cwDialogClose]',
  host: {
    '[attr.aria-disabled]': 'dialog?.pending() ? "true" : null',
    '(click)': 'dialog?.requestClose("close")',
  },
})
export class CwDialogClose {
  protected readonly dialog = inject(CW_DIALOG, { optional: true });

  constructor() {
    // Capture phase: the guard runs before the consumer's own (click) listener on the same element.
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.addEventListener(
      'click',
      (event) => {
        if (this.dialog?.pending()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true },
    );
  }
}
