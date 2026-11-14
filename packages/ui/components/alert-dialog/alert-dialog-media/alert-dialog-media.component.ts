import { Component, computed, inject, type Signal } from '@angular/core';

import { CW_ALERT_DIALOG, type CwAlertDialogContext } from '../alert-dialog.token';

/* Literal class strings (Alert Dialog sheet and preview): an icon alone, 32 px, without a
   background; never a red background on the dialog. */
/**
 * Constant LAYOUTS
 *
 * @description
 * Media layout classes by dialog size.
 *
 * @type {Readonly<Record<'sm' | 'default', string>>}
 */
const LAYOUTS: Readonly<Record<'sm' | 'default', string>> = {
  sm: 'mx-auto flex size-10 items-center justify-center [&_ng-icon]:[--ng-icon__size:2rem]',
  default: 'flex size-10 items-center justify-center [&_ng-icon]:[--ng-icon__size:2rem]',
} as const;

/**
 * Constant TONES
 *
 * @description
 * Media color classes by dialog variant.
 *
 * @type {Readonly<Record<'destructive' | 'default', string>>}
 */
const TONES: Readonly<Record<'destructive' | 'default', string>> = {
  destructive: 'text-destructive',
  default: 'text-foreground',
} as const;

/**
 * Component CwAlertDialogMedia
 *
 * @description
 * The optional icon of a `cw-alert-dialog`, above its title: `phosphorWarningCircleFill` for a
 * destructive action, mostly in the `sm` size.
 *
 * Decorative (`aria-hidden`): the title and the action carry the meaning. Colored by the dialog's
 * `variant` (`text-destructive`); projected first whatever its place in the content.
 */
@Component({
  selector: 'cw-alert-dialog-media',
  host: { 'aria-hidden': 'true', '[class]': 'classes()' },
  templateUrl: './alert-dialog-media.component.html',
})
export class CwAlertDialogMedia {
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
   * Property classes
   * @readonly
   *
   * @description
   * Classes derived from the dialog appearance.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () =>
      `${LAYOUTS[this.dialog?.size() ?? 'sm']} ${TONES[this.dialog?.variant() ?? 'destructive']}`,
  );
  // #endregion
}
