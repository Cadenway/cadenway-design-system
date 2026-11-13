import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { CwAlert } from './alert.component';

/** The title of an alert: names the situation (« Envoi des e-mails interrompu »). */
@Component({
  selector: 'cw-alert-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  templateUrl: './alert-title.component.html',
})
export class CwAlertTitle {
  private readonly alert = inject(CwAlert, { optional: true });

  protected readonly classes = computed(() =>
    this.alert?.size() === 'compact'
      ? 'block min-w-0 flex-1 leading-5 font-medium'
      : 'block leading-5 font-medium',
  );
}
