import { ChangeDetectionStrategy, Component } from '@angular/core';

/** A 1 px line between two runs of items of a group, inset from the edges; decorative. */
@Component({
  selector: 'cw-item-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mx-3 block h-px shrink-0 bg-border', 'aria-hidden': 'true' },
  templateUrl: './item-separator.component.html',
})
export class CwItemSeparator {}
