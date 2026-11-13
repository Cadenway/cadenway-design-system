import { _IdGenerator } from '@angular/cdk/a11y';
import { Directive, inject } from '@angular/core';

import { CW_ALERT_DIALOG } from '../alert-dialog.token';

/**
 * The consequences in a `cw-alert-dialog`, counted (« Ses 64 tâches … seront supprimés
 * définitivement. »); it describes the dialog (`aria-describedby`), read as soon as it opens.
 *
 * Put it on a `p`; its `id` is set by the dialog.
 */
@Directive({
  selector: 'p[cwAlertDialogDescription]',
  host: { class: 'text-sm text-pretty text-muted-foreground', '[id]': 'id' },
})
export class CwAlertDialogDescription {
  protected readonly id =
    inject(CW_ALERT_DIALOG, { optional: true })?.descriptionId ??
    inject(_IdGenerator).getId('cw-alert-dialog-description-');
}
