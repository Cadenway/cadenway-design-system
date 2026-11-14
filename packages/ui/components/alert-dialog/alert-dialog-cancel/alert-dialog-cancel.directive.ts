import { Directive, ElementRef, inject } from '@angular/core';

import { CW_ALERT_DIALOG, type CwAlertDialogContext } from '../alert-dialog.token';

/**
 * Directive CwAlertDialogCancel
 *
 * @description
 * The « Annuler » button of a `cw-alert-dialog` (`outline`): it emits `cancel` with the reason
 * `button` and closes the dialog; it has the focus when the dialog opens.
 *
 * While the dialog is `pending` it is `aria-disabled` (dimmed by `cwButton`, still focusable) and
 * its clicks are ignored, before the consumer's own `(click)`.
 */
@Directive({
  selector: 'button[cwAlertDialogCancel]',
  host: {
    '[attr.aria-disabled]': 'dialog?.pending() ? "true" : null',
    '(click)': 'dialog?.requestCancel("button")',
  },
})
export class CwAlertDialogCancel {
  // #region Properties
  /**
   * Property dialog
   * @readonly
   *
   * @description
   * Parent alert dialog context when present.
   *
   * @type {CwAlertDialogContext | null}
   */
  protected readonly dialog: CwAlertDialogContext | null = inject(CW_ALERT_DIALOG, {
    optional: true,
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Prevents blocked clicks before consumer handlers run.
   */
  public constructor() {
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
  // #endregion
}
