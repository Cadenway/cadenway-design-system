import { Component, computed, inject } from '@angular/core';

import { CW_ALERT_DIALOG } from '../alert-dialog.token';

/* Literal class strings (Alert Dialog sheet and preview): an icon alone, 32 px, without a
   background; never a red background on the dialog. */
const LAYOUTS = {
  sm: 'mx-auto flex size-10 items-center justify-center [&_ng-icon]:[--ng-icon__size:2rem]',
  default: 'flex size-10 items-center justify-center [&_ng-icon]:[--ng-icon__size:2rem]',
} as const;

const TONES = {
  destructive: 'text-destructive',
  default: 'text-foreground',
} as const;

/**
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
  private readonly dialog = inject(CW_ALERT_DIALOG, { optional: true });

  protected readonly classes = computed(
    () =>
      `${LAYOUTS[this.dialog?.size() ?? 'sm']} ${TONES[this.dialog?.variant() ?? 'destructive']}`,
  );
}
