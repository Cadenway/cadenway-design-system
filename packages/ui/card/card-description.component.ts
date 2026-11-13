import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The one-sentence description under a card title, in `text-muted-foreground`. */
@Component({
  selector: 'cw-card-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'col-start-1 block text-sm text-muted-foreground' },
  templateUrl: './card-description.component.html',
})
export class CwCardDescription {}
