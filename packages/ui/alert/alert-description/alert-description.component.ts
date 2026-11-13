import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { CwAlert } from '../alert/alert.component';

/** The description of an alert: what to do; muted, or the error color in a `destructive` alert. */
@Component({
  selector: 'cw-alert-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  templateUrl: './alert-description.component.html',
})
export class CwAlertDescription {
  private readonly alert = inject(CwAlert, { optional: true });

  protected readonly classes = computed(() =>
    this.alert?.variant() === 'destructive'
      ? 'block leading-5 text-grenat-text'
      : 'block leading-5 text-muted-foreground',
  );
}
