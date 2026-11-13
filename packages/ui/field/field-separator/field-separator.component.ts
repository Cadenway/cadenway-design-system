import { ChangeDetectionStrategy, Component } from '@angular/core';

/** A thin line between two sub-groups of a `cw-field-group`; `role="separator"`. */
@Component({
  selector: 'cw-field-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'separator', class: 'block h-px w-full shrink-0 bg-border' },
  templateUrl: './field-separator.component.html',
})
export class CwFieldSeparator {}
