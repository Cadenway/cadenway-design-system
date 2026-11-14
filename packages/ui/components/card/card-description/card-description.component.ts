import { Component } from '@angular/core';

/**
 * Class CwCardDescription
 * @class CwCardDescription
 *
 * @description
 * Presents the muted one-sentence description below a card title.
 */
@Component({
  selector: 'cw-card-description',
  host: { class: 'col-start-1 block text-sm text-muted-foreground' },
  templateUrl: './card-description.component.html',
})
export class CwCardDescription {}
