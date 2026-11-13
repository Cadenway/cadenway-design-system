import { Directive, ElementRef, inject } from '@angular/core';

import { CW_ALERT_DIALOG } from '../alert-dialog.token';

/**
 * The action of a `cw-alert-dialog` (`destructive` or `default` `cwButton`), repeating the verb of
 * the title (« Supprimer la liste »): it emits the dialog's `confirm`.
 *
 * `aria-disabled` (dimmed by `cwButton`, still focusable) while the typed text differs from
 * `confirmText` and while the dialog is `pending`; its clicks are then ignored, before the
 * consumer's own `(click)`. Bind `[loading]` to the same state as `pending` for the spinner.
 */
@Directive({
  selector: 'button[cwAlertDialogAction]',
  host: {
    '[attr.aria-disabled]': 'blocked() ? "true" : null',
    '(click)': 'dialog?.requestConfirm()',
  },
})
export class CwAlertDialogAction {
  protected readonly dialog = inject(CW_ALERT_DIALOG, { optional: true });

  constructor() {
    // Capture phase: the guard runs before the consumer's own (click) listener on the same element.
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.addEventListener(
      'click',
      (event) => {
        if (this.blocked()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true },
    );
  }

  protected blocked(): boolean {
    const dialog = this.dialog;
    return dialog ? dialog.pending() || !dialog.confirmed() : false;
  }
}
