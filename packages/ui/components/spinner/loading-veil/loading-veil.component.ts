import { Component, input, type InputSignal } from '@angular/core';

import { CwSpinner } from '../spinner.component';

/**
 * Class CwLoadingVeil
 * @class CwLoadingVeil
 *
 * @description
 * Covers a refreshing area with a translucent background and a centered large spinner.
 */
@Component({
  selector: 'cw-loading-veil',
  imports: [CwSpinner],
  host: {
    class:
      'absolute inset-0 z-10 grid place-items-center bg-background/70 text-foreground animate-fade-in',
  },
  templateUrl: './loading-veil.component.html',
})
export class CwLoadingVeil {
  // #region Properties
  /**
   * Property label
   * @readonly
   *
   * @description
   * Accessible name of the wait displayed by the veil's spinner.
   *
   * @type {InputSignal<string>}
   * @default 'Chargement'
   */
  public readonly label: InputSignal<string> = input('Chargement');
  // #endregion
}
