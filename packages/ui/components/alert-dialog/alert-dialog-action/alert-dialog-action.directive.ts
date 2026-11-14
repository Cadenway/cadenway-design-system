import { Directive, ElementRef, inject } from '@angular/core';

import { CW_ALERT_DIALOG, type CwAlertDialogContext } from '../alert-dialog.token';

/**
 * Directive CwAlertDialogAction
 *
 * @description
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
        if (this.blocked()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true },
    );
  }
  // #endregion

  // #region Methods
  /**
   * Method blocked
   *
   * @description
   * Reports whether confirmation is unavailable.
   *
   * @returns {boolean} Whether the dialog is pending or its confirmation text does not match.
   */
  protected blocked(): boolean {
    const dialog: CwAlertDialogContext | null = this.dialog;
    return dialog ? dialog.pending() || !dialog.confirmed() : false;
  }
  // #endregion
}
