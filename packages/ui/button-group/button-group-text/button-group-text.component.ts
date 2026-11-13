import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * A non-interactive text or icon that names what follows in a `cw-button-group` (« Déplacer vers »
 * before the sprint choice).
 */
@Component({
  selector: 'cw-button-group-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex items-center gap-2 rounded-lg border border-input bg-muted px-2.5 text-sm text-muted-foreground [&_ng-icon]:shrink-0 [&_ng-icon]:[--ng-icon__size:1rem]',
  },
  templateUrl: './button-group-text.component.html',
})
export class CwButtonGroupText {}
