import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { CwAlert } from '../alert.component';

/**
 * The actions of an alert: one or two `outline` or `ghost` `sm` buttons, under the text, or at the
 * right in a `compact` alert. In a `destructive` alert their text inherits the error color.
 */
@Component({
  selector: 'cw-alert-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  templateUrl: './alert-actions.component.html',
})
export class CwAlertActions {
  private readonly alert = inject(CwAlert, { optional: true });

  protected readonly classes = computed(() =>
    this.alert?.size() === 'compact'
      ? 'flex shrink-0 items-center gap-2 self-center'
      : 'mt-2 flex items-center gap-2',
  );
}
