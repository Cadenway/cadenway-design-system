import { Component, input } from '@angular/core';

import { CwSpinner } from '../spinner.component';

/** The veil drawn over a refreshing area: a translucent background and a centered `lg` spinner. */
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
  /** Accessible name of the wait. */
  readonly label = input('Chargement');
}
