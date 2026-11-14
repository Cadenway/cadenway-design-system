import { Component, computed, inject, type Signal } from '@angular/core';

import { CwAlert } from '../alert.component';

/**
 * Class CwAlertActions
 * @class CwAlertActions
 *
 * @description
 * The actions of an alert: one or two `outline` or `ghost` `sm` buttons, under the text, or at the
 * right in a `compact` alert. In a `destructive` alert their text inherits the error color.
 */
@Component({
  selector: 'cw-alert-actions',
  host: {
    '[class]': 'classes()',
  },
  templateUrl: './alert-actions.component.html',
})
export class CwAlertActions {
  // #region Properties
  /**
   * Property alert
   * @readonly
   *
   * @description
   * Parent alert used to select action placement, or null outside an alert.
   *
   * @type {CwAlert | null}
   */
  private readonly alert: CwAlert | null = inject(CwAlert, { optional: true });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Action layout classes for compact or standard alert content.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() =>
    this.alert?.size() === 'compact'
      ? 'flex shrink-0 items-center gap-2 self-center'
      : 'mt-2 flex items-center gap-2',
  );
  // #endregion
}
