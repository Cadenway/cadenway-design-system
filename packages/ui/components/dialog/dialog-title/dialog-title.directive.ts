import { _IdGenerator } from '@angular/cdk/a11y';
import { Directive, inject } from '@angular/core';

import { CW_DIALOG } from '../dialog.token';

/**
 * Directive CwDialogTitle
 *
 * @description
 * The title of a `cw-dialog`, an infinitive or a question (« Renommer la liste »); required, it
 * names the window (`aria-labelledby`).
 *
 * Put it on an `h2` inside `cw-dialog-header`; its `id` is set by the dialog.
 */
@Directive({
  selector: 'h2[cwDialogTitle]',
  host: { class: 'text-lg leading-none font-semibold', '[id]': 'id' },
})
export class CwDialogTitle {
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
    inject(CW_DIALOG, { optional: true })?.titleId ??
    inject(_IdGenerator).getId('cw-dialog-title-');
  // #endregion
}
