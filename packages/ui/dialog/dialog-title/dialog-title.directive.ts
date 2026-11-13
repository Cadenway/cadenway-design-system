import { _IdGenerator } from '@angular/cdk/a11y';
import { Directive, inject } from '@angular/core';

import { CW_DIALOG } from '../dialog.token';

/**
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
  protected readonly id =
    inject(CW_DIALOG, { optional: true })?.titleId ??
    inject(_IdGenerator).getId('cw-dialog-title-');
}
