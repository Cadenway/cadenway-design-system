import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The title of a card, `text-base font-semibold` (14 px); it names the block. */
@Component({
  selector: 'cw-card-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'col-start-1 block text-base leading-5 font-semibold' },
  templateUrl: './card-title.component.html',
})
export class CwCardTitle {}
