import { _IdGenerator } from '@angular/cdk/a11y';
import { Directive, inject } from '@angular/core';

import { CW_DIALOG } from '../dialog.token';

/**
 * The description of a `cw-dialog`: what the task changes, in one or two sentences; it describes
 * the window (`aria-describedby`).
 *
 * Put it on a `p` inside `cw-dialog-header`; its `id` is set by the dialog.
 */
@Directive({
  selector: 'p[cwDialogDescription]',
  host: { class: 'text-sm text-pretty text-muted-foreground', '[id]': 'id' },
})
export class CwDialogDescription {
  protected readonly id =
    inject(CW_DIALOG, { optional: true })?.descriptionId ??
    inject(_IdGenerator).getId('cw-dialog-description-');
}
