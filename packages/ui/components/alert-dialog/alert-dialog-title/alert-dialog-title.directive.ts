import { _IdGenerator } from '@angular/cdk/a11y';
import { Directive, computed, inject } from '@angular/core';

import { CW_ALERT_DIALOG } from '../alert-dialog.token';

const SIZES = {
  sm: 'text-base font-semibold',
  default: 'text-lg leading-none font-semibold',
} as const;

/**
 * The question of a `cw-alert-dialog`, with the object's name (« Supprimer la liste « Backlog » ? »);
 * required, it names the dialog (`aria-labelledby`).
 *
 * Put it on an `h2`; its `id` is set by the dialog, its size follows the dialog's.
 */
@Directive({
  selector: 'h2[cwAlertDialogTitle]',
  host: { '[class]': 'classes()', '[id]': 'id' },
})
export class CwAlertDialogTitle {
  private readonly dialog = inject(CW_ALERT_DIALOG, { optional: true });

  protected readonly id =
    this.dialog?.titleId ?? inject(_IdGenerator).getId('cw-alert-dialog-title-');
  protected readonly classes = computed(() => SIZES[this.dialog?.size() ?? 'default']);
}
