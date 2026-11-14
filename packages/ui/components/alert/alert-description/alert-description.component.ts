import { Component, computed, inject, type Signal } from '@angular/core';

import { CwAlert } from '../alert.component';

/**
 * Class CwAlertDescription
 * @class CwAlertDescription
 *
 * @description
 * Presents alert guidance in muted text, or the error color for a destructive alert.
 */
@Component({
  selector: 'cw-alert-description',
  host: {
    '[class]': 'classes()',
  },
  templateUrl: './alert-description.component.html',
})
export class CwAlertDescription {
  // #region Properties
  /**
   * Property alert
   * @readonly
   *
   * @description
   * Parent alert used to select the description tone, or null outside an alert.
   *
   * @type {CwAlert | null}
   */
  private readonly alert: CwAlert | null = inject(CwAlert, { optional: true });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Description classes using the destructive tone when the parent alert requires it.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() =>
    this.alert?.variant() === 'destructive'
      ? 'block leading-5 text-grenat-text'
      : 'block leading-5 text-muted-foreground',
  );
  // #endregion
}
