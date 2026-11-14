import { Component, computed, inject, type Signal } from '@angular/core';

import { CwAlert } from '../alert.component';

/**
 * Class CwAlertTitle
 * @class CwAlertTitle
 *
 * @description
 * Names the situation described by an alert, such as an interrupted email delivery.
 */
@Component({
  selector: 'cw-alert-title',
  host: {
    '[class]': 'classes()',
  },
  templateUrl: './alert-title.component.html',
})
export class CwAlertTitle {
  // #region Properties
  /**
   * Property alert
   * @readonly
   *
   * @description
   * Parent alert used to select compact layout, or null outside an alert.
   *
   * @type {CwAlert | null}
   */
  private readonly alert: CwAlert | null = inject(CwAlert, { optional: true });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Title classes, expanding within the row when the parent uses compact layout.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() =>
    this.alert?.size() === 'compact'
      ? 'block min-w-0 flex-1 leading-5 font-medium'
      : 'block leading-5 font-medium',
  );
  // #endregion
}
