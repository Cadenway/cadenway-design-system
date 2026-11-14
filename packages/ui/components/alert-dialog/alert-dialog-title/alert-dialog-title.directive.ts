import { _IdGenerator } from '@angular/cdk/a11y';
import { Directive, computed, inject, type Signal } from '@angular/core';

import { CW_ALERT_DIALOG, type CwAlertDialogContext } from '../alert-dialog.token';

/**
 * Constant SIZES
 *
 * @description
 * Title classes by dialog size.
 *
 * @type {Readonly<Record<'sm' | 'default', string>>}
 */
const SIZES: Readonly<Record<'sm' | 'default', string>> = {
  sm: 'text-base font-semibold',
  default: 'text-lg leading-none font-semibold',
} as const;

/**
 * Directive CwAlertDialogTitle
 *
 * @description
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
  private readonly dialog: CwAlertDialogContext | null = inject(CW_ALERT_DIALOG, {
    optional: true,
  });

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
    this.dialog?.titleId ?? inject(_IdGenerator).getId('cw-alert-dialog-title-');

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Classes derived from the dialog appearance.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => SIZES[this.dialog?.size() ?? 'default'],
  );
  // #endregion
}
