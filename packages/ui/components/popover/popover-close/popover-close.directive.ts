import { Directive, inject } from '@angular/core';

import { CwPopover } from '../popover.component';

/**
 * Closes the enclosing `cw-popover` on click: « Annuler », or « Enregistrer » once the consumer has
 * saved (Popover sheet, "Règles": close after saving). The focus returns to the trigger. Put it on
 * a `button` projected into the popover; the button's own `(click)` still runs.
 */
@Directive({
  selector: 'button[cwPopoverClose]',
  host: { '(click)': 'close()' },
})
export class CwPopoverClose {
  private readonly popover = inject(CwPopover);

  protected close(): void {
    this.popover.close();
  }
}
