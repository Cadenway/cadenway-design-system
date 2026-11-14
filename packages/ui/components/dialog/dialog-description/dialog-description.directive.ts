import { _IdGenerator } from '@angular/cdk/a11y';
import { Directive, inject } from '@angular/core';

import { CW_DIALOG } from '../dialog.token';

/**
 * Directive CwDialogDescription
 *
 * @description
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
  // #region Properties
  /**
   * Property id
   * @readonly
   *
   * @description
   * Identifier used by the dialog.
   *
   * @type {string}
   */
  protected readonly id: string =
    inject(CW_DIALOG, { optional: true })?.descriptionId ??
    inject(_IdGenerator).getId('cw-dialog-description-');
  // #endregion
}
