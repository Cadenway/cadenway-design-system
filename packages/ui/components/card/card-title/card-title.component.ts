import { Component } from '@angular/core';

/**
 * Class CwCardTitle
 * @class CwCardTitle
 *
 * @description
 * Names the card block using the Card sheet's semibold title style.
 */
@Component({
  selector: 'cw-card-title',
  host: { class: 'col-start-1 block text-base leading-5 font-semibold' },
  templateUrl: './card-title.component.html',
})
export class CwCardTitle {}
