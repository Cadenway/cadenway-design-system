import { Directive, inject } from '@angular/core';

import { CwPopover } from '../popover.component';

/**
 * Directive CwPopoverClose
 *
 * @description
 * Closes the enclosing `cw-popover` on click: « Annuler », or « Enregistrer » once the consumer has
 * saved (Popover sheet, "Règles": close after saving). The focus returns to the trigger. Put it on
 * a `button` projected into the popover; the button's own `(click)` still runs.
 */
@Directive({
  selector: 'button[cwPopoverClose]',
  host: { '(click)': 'close()' },
})
export class CwPopoverClose {
  // #region Properties
  /**
   * Property popover
   * @readonly
   *
   * @description
   * Parent popover to close.
   *
   * @type {CwPopover}
   */
  private readonly popover: CwPopover = inject(CwPopover);
  // #endregion

  // #region Methods
  /**
   * Method close
   *
   * @description
   * Closes the parent popover.
   */
  protected close(): void {
    this.popover.close();
  }
  // #endregion
}
